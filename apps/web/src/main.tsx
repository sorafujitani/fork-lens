import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return (
    <main>
      <p className="eyebrow">Fork Lens</p>
      <h1>fork の変更を、見通す。</h1>
      <p>公開リポジトリの fork にある独自の変更を整理し、取り込みたい変更を見つける。</p>
      <p className="note">準備中</p>
    </main>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Root element is missing');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
