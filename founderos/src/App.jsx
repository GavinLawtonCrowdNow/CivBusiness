import { useReducer, useRef } from 'react';
import { gameReducer } from './game/engine.js';
import { INITIAL_STATE } from './game/constants.js';
import { drawHand } from './game/cards.js';
import ResourceBar from './components/ResourceBar.jsx';
import BudgetPanel from './components/BudgetPanel.jsx';
import CardHand from './components/CardHand.jsx';
import EventLog from './components/EventLog.jsx';
import EndQuarterButton from './components/EndQuarterButton.jsx';
import AcquisitionModal from './components/AcquisitionModal.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';

function initState() {
  const hand = drawHand(INITIAL_STATE, 4);
  return { ...INITIAL_STATE, hand };
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, initState);
  const prevStateRef = useRef(null);

  const prevState = prevStateRef.current;
  prevStateRef.current = state;

  function handleRestart() {
    dispatch({ type: 'NEW_GAME', INITIAL_STATE });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0b0f] text-slate-200">
      <ResourceBar state={state} prevState={prevState} />

      <div className="flex flex-1 overflow-hidden gap-3 p-3">
        <div className="w-56 shrink-0 overflow-auto">
          <BudgetPanel state={state} dispatch={dispatch} />
        </div>

        <div className="flex-1 min-w-0 overflow-auto">
          <CardHand state={state} dispatch={dispatch} />
        </div>

        <div className="w-64 shrink-0 overflow-hidden">
          <EventLog log={state.log} />
        </div>
      </div>

      <EndQuarterButton state={state} dispatch={dispatch} />

      {state.acquisitionOffer && !state.gameOver && (
        <AcquisitionModal
          offer={state.acquisitionOffer}
          onAccept={() => dispatch({ type: 'ACCEPT_ACQUISITION' })}
          onDecline={() => dispatch({ type: 'DECLINE_ACQUISITION' })}
        />
      )}

      {state.gameOver && (
        <GameOverScreen state={state} onRestart={handleRestart} />
      )}
    </div>
  );
}
