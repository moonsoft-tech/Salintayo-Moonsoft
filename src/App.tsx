import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import ProtectedRoute from './components/ProtectedRoute';
import QuickChatBubble from './pages/QuickChatBubble';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Verification from './pages/Verification';
import NewPassword from './pages/NewPassword';
import WelcomeSlide from './pages/WelcomeSlide';
import Learn from './pages/Learn';
import Quiz from './pages/Quiz';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <QuickChatBubble />
      <IonRouterOutlet>
        <ProtectedRoute exact path="/home">
          <Home />
        </ProtectedRoute>
        <ProtectedRoute exact path="/learn">
          <Learn />
        </ProtectedRoute>
        <ProtectedRoute exact path="/quiz">
          <Quiz />
        </ProtectedRoute>
        <ProtectedRoute exact path="/chat">
          <Chat />
        </ProtectedRoute>
        <ProtectedRoute exact path="/profile">
          <Profile />
        </ProtectedRoute>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <ProtectedRoute exact path="/welcome">
          <WelcomeSlide />
        </ProtectedRoute>
        
        
        <Route exact path="/login">
          <LoginPage />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
        <Route exact path="/forgot-password">
          <ForgotPassword />
        </Route>
        <Route exact path="/verification">
          <Verification />
        </Route>
        <Route exact path="/new-password">
          <NewPassword />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
