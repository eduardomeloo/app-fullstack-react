import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TabelaUsuarios = ({ atualizaTabela, onAtualizaTabela, setUsuarioSelecionado }) => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        axios.get('http://192.168.100.118:3001/api/usuarios')
            .then((response) => setUsuarios(response.data));
    }, [atualizaTabela]);

    function handleEditar(id) {
        const usuario = usuarios.find((u) => u.ID === id);
        setUsuarioSelecionado(usuario);
    }

    function handleExcluir(id) {
        axios.delete(`http://192.168.100.118:3001/api/usuarios/${id}`)
            .then(() => {
                setUsuarioSelecionado(null);
                onAtualizaTabela();
                toast.success('Usuário excluído com sucesso!');
            });
    }

    return (
        <div className="overflow-x-auto px-8 pt-6 pb-8 mb-4 flex flex-col my-2 bg-white">
            <table className="min-w-full border-collapse">
                <thead className="bg-gray-200">
                <tr>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold uppercase">Nome</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold uppercase">Telefone</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold uppercase">E-mail</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold uppercase">Data de Nascimento</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold uppercase">Data de Cadastro</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold uppercase">Ações</th>
                </tr>
                </thead>
                <tbody>
                {usuarios.map((usuario) => (
                    <tr key={usuario.ID} className="hover:bg-gray-100 border-b border-gray-200">
                    <td className="py-4 px-6 whitespace-nowrap">{usuario.NOME}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{usuario.TELEFONE}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{usuario.EMAIL}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{usuario.DATA_NASCIMENTO}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{usuario.DATA_CADASTRO}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded m-1" onClick={() => handleEditar(usuario.ID)}>Editar</button>
                        <button className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded m-1" onClick={() => handleExcluir(usuario.ID)}>Excluir</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

    );
}

export default TabelaUsuarios;
