
import React from 'react';
import { NotificationEvent } from '../types';

interface EventHistoryProps {
    events: NotificationEvent[];
    onClearHistory: () => void;
}

const EventItem: React.FC<{event: NotificationEvent}> = ({ event }) => {
    const isEnter = event.type === 'enter';
    const bgColor = isEnter ? 'bg-green-900/50' : 'bg-yellow-900/50';
    const iconColor = isEnter ? 'text-green-400' : 'text-yellow-400';

    const icon = isEnter ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16l-4-4m0 0l4-4m-4 4h14m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
    );

    return (
        <li className={`flex items-start space-x-3 p-3 rounded-lg ${bgColor}`}>
            <div className={`flex-shrink-0 ${iconColor}`}>{icon}</div>
            <div>
                <p className="font-semibold">{event.fenceName}</p>
                <p className={`text-sm ${iconColor}`}>
                    {isEnter ? 'Entered zone' : 'Exited zone'}
                </p>
                <p className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                </p>
            </div>
        </li>
    );
};


export const EventHistory: React.FC<EventHistoryProps> = ({ events, onClearHistory }) => {
    return (
        <div className="flex-grow p-4 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3 border-t border-gray-700 pt-3">
              <h3 className="text-xl font-semibold">Event History</h3>
              {events.length > 0 && (
                <button onClick={onClearHistory} className="text-sm text-blue-400 hover:text-blue-300">Clear</button>
              )}
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-2">
                {events.length > 0 ? (
                    <ul className="space-y-2">
                        {events.map(event => <EventItem key={event.id} event={event} />)}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No events recorded.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
