/**
 * FAQ Detail Page - Exibe detalhes de uma FAQ
 */

import { useRouter } from 'next/router';
import Head from 'next/head';
import { MOCK_FAQS } from '@/lib/mockData/faqs';
import { IOSNavigationBar } from '@/components/Navigation';
import { IOSCard } from '@/components/IOSCard';

export default function FAQDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    // Buscar FAQ
    const faq = MOCK_FAQS.find((f) => f.id === id);

    // Loading state - aguarda o router carregar o id
    if (!router.isReady || !id) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#F2F2F7',
            }} />
        );
    }

    if (!faq) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#F2F2F7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px'
            }}>
                <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#000' }}>FAQ não encontrada</h2>
                <button
                    onClick={() => router.back()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007AFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '17px',
                        cursor: 'pointer'
                    }}
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{faq.question}</title>
            </Head>

            <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F7' }}>
                <IOSNavigationBar />

                {/* Content */}
                <div style={{ padding: '16px' }}>
                    {/* Question */}
                    <IOSCard style={{ marginBottom: '16px' }}>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            margin: '0 0 8px',
                            color: '#000',
                            lineHeight: '1.3'
                        }}>
                            {faq.question}
                        </h1>
                        <p style={{
                            fontSize: '13px',
                            color: '#8E8E93',
                            margin: 0
                        }}>
                            👍 {faq.helpfulCount} pessoas acharam útil
                        </p>
                    </IOSCard>

                    {/* Answer */}
                    <IOSCard>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            margin: '0 0 16px',
                            color: '#000'
                        }}>
                            Resposta
                        </h2>
                        <div style={{
                            fontSize: '17px',
                            lineHeight: '1.6',
                            color: '#000',
                            whiteSpace: 'pre-line'
                        }}>
                            {faq.answer}
                        </div>
                    </IOSCard>

                    {/* Tags */}
                    {faq.tags.length > 0 && (
                        <IOSCard style={{ marginTop: '16px' }}>
                            <h3 style={{
                                fontSize: '17px',
                                fontWeight: '600',
                                margin: '0 0 12px',
                                color: '#000'
                            }}>
                                Tags
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {faq.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#F2F2F7',
                                            borderRadius: '16px',
                                            fontSize: '15px',
                                            color: '#007AFF'
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </IOSCard>
                    )}
                </div>
            </div>
        </>
    );
}
