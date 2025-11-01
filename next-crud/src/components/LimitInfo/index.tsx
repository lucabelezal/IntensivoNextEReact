import styles from "./LimitInfo.module.css";

interface LimitInfoProps {
    total: number;
    used: number;
}

function LimitInfo({ total, used }: LimitInfoProps) {
    const available = total - used;

    return (
        <div className={styles.container}>
            <div className={styles.row}>
                <span className={styles.label}>Limite Total:</span>
                <span className={styles.value}>R$ {total.toLocaleString()}</span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Em Uso:</span>
                <span className={styles.value}>R$ {used.toLocaleString()}</span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Disponível:</span>
                <span className={styles.value}>R$ {available.toLocaleString()}</span>
            </div>
        </div>
    );
}

export default LimitInfo;
