// import Layout from "@/components/Layout";
// import Tabela from "@/components/Tabela";
// import Cliente from "@/core/Cliente";

// export default function Home() {

//     const clientes = [
//         new Cliente('Ana', 3456, '1'),
//         new Cliente('Maria', 1234, '2'),
//         new Cliente('João', 5678, '3'),
//     ]

//     return (
//         <div className={'flex items-center justify-center h-screen'}>
//             <Layout titulo="Bem-vindo à página inicial">
//                 <Tabela clientes={clientes} />
//             </Layout>
//         </div>
//     );
// }


import useLimitForm from '@/hooks/useLimitForm';
import CardLimitInput from "../components/CardLimitInput";
import LimitInfo from "../components/LimitInfo";
import ActionButtons from "../components/ActionButtons";
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

// A lógica de parsing/validação do input foi movida para o hook useLimitForm

function Home() {
    const totalLimit = 10000;
    const usedLimit = 4000;
    // usar hook para encapsular state e validação
    const { newLimit, setNewLimit, numericLimit, canSave, validationMessage } = useLimitForm(usedLimit);

    const { toast, hideToast, success } = useToast();

    const handleSave = () => {
        // aqui você pode chamar a API para salvar; após sucesso mostramos o toast
        success(`Novo limite: R$ ${numericLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    };
    const handleCancel = () => alert("Cancelado");

    return (
        <div className="min-h-screen flex flex-col justify-between p-4 bg-[#F5F5F5]">
            <div className="flex flex-col gap-4">
                <h1 className="text-xl font-bold text-[#005BAA]">Aumentar Limite do Cartão</h1>
                <p className="text-[#333333]">
                    Defina um novo limite disponível para o seu cartão. O valor deve respeitar as regras de uso.
                </p>

                <CardLimitInput value={newLimit} onChange={setNewLimit} />

                {validationMessage ? (
                    <p className="text-sm text-red-600 mt-2">{validationMessage}</p>
                ) : null}

                <LimitInfo total={totalLimit} used={usedLimit} />
            </div>

            <ActionButtons onCancel={handleCancel} onSave={handleSave} canSave={canSave} />
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={4000}
                position="top"
            />
        </div>
    );
}

export default Home;
