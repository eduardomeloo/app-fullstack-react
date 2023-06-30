const express = require('express');
const router = express.Router();
const { getConnection, oracledb } = require('../database/oracleConnection');
const { existsOrError } = require('./validations');

router.get('/usuarios', async (req, res) => {  
    let conn;

    try {
        conn = await getConnection();

        const select = `select  p.id,
                                p.nome,
                                p.telefone,
                                p.email,
                                TO_CHAR(p.data_nascimento, 'DD/MM/YYYY') data_nascimento,
                                TO_CHAR(p.data_cadastro, 'DD/MM/YYYY HH24:MI:SS') data_cadastro
                        from pessoa p
                        where 1=1
                        ${req.query.nome ? `and upper(p.nome) like '%${req.query.nome.toUpperCase()}%'` : ''}
                        ${req.query.telefone ? `and upper(p.telefone) like '%${req.query.telefone.toUpperCase()}%'` : ''}
                        ${req.query.email ? `and upper(p.email) like '%${req.query.email.toUpperCase()}%'` : ''}
                        ${req.query.dataNascimento ? `and TO_CHAR(p.data_nascimento, 'DD/MM/YYYY') like '%${req.query.dataNascimento}%'` : ''}
                        order by data_cadastro desc`

        const result = await conn.execute(select, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

router.post('/usuarios', async (req, res) => {
    const { nome, telefone, email, dataNascimento } = req.body;

    try {
        existsOrError(nome, 'O Nome não foi informado.')
        existsOrError(telefone, 'O Telefone não foi informado.')
        existsOrError(email, 'O E-mail não foi informado.')
        existsOrError(dataNascimento, 'A data de nascimento não foi informada.')
    } catch (msg) {
        return res.status(400).send(msg)
    }

    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `INSERT INTO pessoa (nome, telefone, email, data_nascimento)
            VALUES (:1, :2, :3, :4)`,
            [nome, telefone, email, dataNascimento]
        );

        let getUser;

        if(result.rowsAffected) {
            await conn.commit();

            getUser = await conn.execute(
                `SELECT * FROM pessoa WHERE ROWID = :1`,
                [result.lastRowid],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            res.status(201).json(getUser.rows);
        }
    
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

router.put('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    const { nome, telefone, email, dataNascimento } = req.body

    try {
        existsOrError(nome, 'O Nome não foi informado.')
        existsOrError(telefone, 'O Telefone não foi informado.')
        existsOrError(email, 'O E-mail não foi informado.')
        existsOrError(dataNascimento, 'A data de nascimento não foi informada.')
    } catch (msg) {
        return res.status(400).send(msg)
    }
    
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `UPDATE pessoa SET nome = :1, telefone = :2, email = :3, data_nascimento = :4
             WHERE id = :5`,
            [nome, telefone, email, dataNascimento, id]
        );

        if (result.rowsAffected === 0) {
            res.status(404).json({ message: 'Registro não encontrado' });
        } else {
            await conn.commit();
            res.status(200).json({ message: 'Registro atualizado com sucesso' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

router.delete('/usuarios/:id', async (req, res) => {
    const id = req.params.id;

    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(`DELETE FROM pessoa WHERE id = :1`, [id]);

        if (result.rowsAffected === 0) {
            res.status(404).send('Registro não encontrado');
        } else {
            await conn.commit();
            res.status(200).send('Registro removido com sucesso');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) {
        await conn.close();
        }
    }
});

module.exports = router;
