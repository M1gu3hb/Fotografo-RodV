import { renderToString } from 'react-dom/server';
import App from './App';
import type { PageData } from './Gallery';
export function render(page: PageData) { return renderToString(<App page={page} />); }
