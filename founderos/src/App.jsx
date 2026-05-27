import { useReducer, useRef } from 'react';
import { gameReducer } from './game/engine.js';
import { INITIAL_STATE } from './game/constants.js';
import { drawHand } from './game/cards.js';
import ResourceBar from './components/ResourceBar.jsx';
import WorkforcePanel from './components/WorkforcePanel.jsx';
import BudgetPanel from './components/BudgetPanel.jsx';
import ProductionQueue from './components/ProductionQueue.jsx';
import CardHand from './components/CardHand.jsx';
import EventLog from './components/EventLog.jsx';
import EndQuarterButton from './components/EndQuarterButton.jsx';
import AcquisitionModal from './components/AcquisitionModal.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';

function initState() {
  return { ...INITIAL_STATE, hand: drawHand(INITIAL_STATE, 4) };
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, initState);
  const prevStateRef = useRef(null);
  const prevState = prevStateRef.current;
  prevStateRef.current = state;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0b0f] text-slate-200">
      {/* Top: resource dashboard */}
      <ResourceBar state={state} prevState={prevState} />

      {/* Main grid: Left | Center | Right */}
      <div className="flex flex-1 overflow-hidden gap-2 p-2 min-h-0">

        {/* Left column: Workforce + Budget */}
        <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto">
          <WorkforcePanel state={state} dispatch={dispatch} />
          <BudgetPanel state={state} dispatch={dispatch} />
        </div>

        {/* Center column: Production Queue (top) + Card Hand (bottom) */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
          <div className="h-[44%] shrink-0">
            <ProductionQueue state={state} dispatch={dispatch} />
          </div>
          <div className="flex-1 min-h-0">
            <CardHand state={state} dispatch={dispatch} />
          </div>
        </div>

        {/* Right column: Event log */}
        <div className="w-60 shrink-0 overflow-hidden">
          <EventLog log={state.log} />
        </div>
      </div>

      {/* Bottom: End Quarter */}
      <EndQuarterButton state={state} dispatch={dispatch} />

      {/* Modals */}
      {state.acquisitionOffer && !state.gameOver && (
        <AcquisitionModal
          offer={state.acquisitionOffer}
          onAccept={() => dispatch({ type: 'ACCEPT_ACQUISITION' })}
          onDecline={() => dispatch({ type: 'DECLINE_ACQUISITION' })}
        />
      )}
      {state.gameOver && (
        <GameOverScreen
          state={state}
          onRestart={() => dispatch({ type: 'NEW_GAME', INITIAL_STATE })}
        />
      )}
    </div>
  );
}
