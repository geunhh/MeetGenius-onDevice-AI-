import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // Redux Provider 임포트
import { store } from './redux/store'; // Redux 스토어 임포트
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> {/* Redux 스토어 제공 */}
      <App />
    </Provider>
  </StrictMode>,
);
