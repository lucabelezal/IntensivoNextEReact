import Layout from "@/components/Layout";
import Tabela from "@/components/Tabela";
import Cliente from "@/core/Cliente";


export default function Home() {

    const clientes = [
        new Cliente('Ana', 3456, '1'),
        new Cliente('Maria', 1234, '2'),
        new Cliente('João', 5678, '3'),
    ]

    return (
        <div className={'flex items-center justify-center h-screen'}>
            <Layout titulo="Welcome to the Home Page">
                <Tabela clientes={clientes} />
            </Layout>
        </div>
    );
}