import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ActionButtons.module.css";
import FixedAboveKeyboard from '@/components/FixedAboveKeyboard';

interface ActionButtonsProps {
    onCancel: () => void;
    onSave: () => void;
    canSave?: boolean;
}

function ActionButtons({ onCancel, onSave, canSave = false }: ActionButtonsProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const buttonNode = (
        <FixedAboveKeyboard bottom={0} extraPadding={0} animateOnOpen openDuration={480} closeDuration={480}>
            <div className={styles.container}>
                <button className={styles.cancel} onClick={onCancel}>
                    Cancelar
                </button>
                <button className={`${styles.save} ${canSave ? "" : styles.disabled}`} disabled={!canSave} onClick={onSave}>
                    Salvar
                </button>
            </div>
        </FixedAboveKeyboard>
    );

    if (!mounted) return null;

    return createPortal(buttonNode, document.body);
}

export default ActionButtons;
