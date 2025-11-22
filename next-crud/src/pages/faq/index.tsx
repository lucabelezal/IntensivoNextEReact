/**
 * FAQ Page - Lista simples de FAQs
 */

import Head from 'next/head';
import Link from 'next/link';
import { MdChevronRight } from 'react-icons/md';
import { MOCK_FAQS } from '@/lib/mockData/faqs';
import { IOSNavigationBar } from '@/components/Navigation';

export default function FAQPage() {
    return (
        <>
            <Head>
                <title>FAQ - Perguntas Frequentes</title>
            </Head>

            <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F7' }}>
                <IOSNavigationBar title="FAQs" />

                {/* Content com Large Title */}
                <div style={{ padding: '16px 16px 0' }}>
                    <h2 style={{
                        fontSize: '34px',
                        fontWeight: 'bold',
                        margin: '0 0 8px',
                        color: '#000'
                    }}>
                        Perguntas Frequentes
                    </h2>
                    <p style={{ color: '#8E8E93', fontSize: '15px', margin: '0 0 16px' }}>
                        Sobre limite de cartão
                    </p>
                </div>                {/* Lista de FAQs */}
                <div style={{ padding: '0 16px 16px' }}>
                    {MOCK_FAQS.map((faq, index) => (
                        <Link
                            key={faq.id}
                            href={`/faq/${faq.id}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'white',
                                padding: '16px',
                                marginBottom: index < MOCK_FAQS.length - 1 ? '1px' : '0',
                                textDecoration: 'none',
                                color: '#000',
                            }}
                        >
                            <div style={{ flex: 1, paddingRight: '16px' }}>
                                <p style={{
                                    fontSize: '17px',
                                    fontWeight: '400',
                                    margin: 0,
                                    lineHeight: '1.4'
                                }}>
                                    {faq.question}
                                </p>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#8E8E93',
                                    margin: '4px 0 0',
                                }}>
                                    {faq.helpfulCount} pessoas acharam útil
                                </p>
                            </div>
                            <MdChevronRight size={20} color="#C6C6C8" />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
