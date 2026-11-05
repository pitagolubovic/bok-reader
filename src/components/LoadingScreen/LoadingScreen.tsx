import type React from "react";
import type { Theme } from "../BokReader/BokReader";
import styles from "./LoadingScreen.module.css";

type LoadingScreenProps = {
    isLoading: boolean;
    // Overrides the inherited reader theme; without it the screen follows the book's theme
    theme?: Theme;
};

export default function LoadingScreen({
    isLoading,
    theme,
}: LoadingScreenProps) {
    return (
        <div
            className={
                isLoading
                    ? styles["loading-screen"]
                    : styles["loading-screen-gon"]
            }
            style={theme as React.CSSProperties | undefined}
            role="status"
            aria-label="Loading book"
            aria-hidden={!isLoading}
        >
            <div className={styles.book}>
                <div className={styles.page}></div>
                <div className={styles.page}></div>
                <div className={styles.page}></div>
            </div>
        </div>
    );
}
