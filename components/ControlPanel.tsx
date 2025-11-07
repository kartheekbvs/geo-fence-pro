
import React, { useState, useEffect } from 'react';
import { GeoFence, FenceStatus, UserProfile } from '../types';

interface ControlPanelProps {
    user: UserProfile;
    onSignOut: () => void;
    isTracking: boolean;
    onToggleTracking: () => void;
    onAddFence: (name: string, radius: number, lat: number, lon: number) => void;
    onDeleteFence: (id: string) => void;
    fences: GeoFence[];
    locationError: string | null;
    newFenceCoords: [number, number] | null;
    clearNewFenceCoords: () => void;
}

const FenceItem: React.FC<{fence: GeoFence, onDelete: (id: string) => void}> = ({ fence, onDelete }) => {
    const statusColor = fence.status === FenceStatus.INSIDE 
        ? 'text-green-400' 
        : fence.status === FenceStatus.OUTSIDE 
        ? 'text-yellow-400'
        : 'text-gray-400';
    
    return (
        <li className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
            <div>
                <p className="font-semibold">{fence.name}</p>
                <p className={`text-sm ${statusColor}`}>{fence.status}</p>
            </div>
            <button onClick={() => onDelete(fence.id)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </button>
        </li>
    );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ user, onSignOut, isTracking, onToggleTracking, onAddFence, onDeleteFence, fences, locationError, newFenceCoords, clearNewFenceCoords }) => {
    const [name, setName] = useState('');
    const [radius, setRadius] = useState('100');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (newFenceCoords) {
            setLat(newFenceCoords[0].toFixed(6));
            setLon(newFenceCoords[1].toFixed(6));
            setShowAddForm(true);
        }
    }, [newFenceCoords]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const radiusNum = parseInt(radius, 10);
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (name && !isNaN(radiusNum) && radiusNum > 0 && !isNaN(latNum) && !isNaN(lonNum)) {
            onAddFence(name, radiusNum, latNum, lonNum);
            setName('');
            setRadius('100');
            setLat('');
            setLon('');
            setShowAddForm(false);
        }
    };
    
    const cancelAdd = () => {
      setShowAddForm(false);
      clearNewFenceCoords();
      setName('');
      setRadius('100');
      setLat('');
      setLon('');
    }

    return (
        <div className="p-4 flex flex-col space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div className="flex items-center space-x-3">
                    <img src={user.picture} referrerPolicy="no-referrer" alt="User profile" className="h-12 w-12 rounded-full" />
                    <div>
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-gray-400">Welcome!</p>
                    </div>
                </div>
                <button onClick={onSignOut} title="Sign Out" className="text-gray-400 hover:text-white transition-colors p-2 rounded-full">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                </button>
            </div>
            
            <button onClick={onToggleTracking} className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-300 ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
            {locationError && <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded-md">{locationError}</p>}

            <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Manage Fences</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {fences.length > 0 ? fences.map(fence => (
                        <FenceItem key={fence.id} fence={fence} onDelete={onDeleteFence} />
                    )) : <p className="text-gray-400 text-center py-4">No fences created yet.</p>}
                </ul>

                {showAddForm ? (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-gray-700/50 p-4 rounded-lg">
                        <input type="text" placeholder="Fence Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="flex space-x-2">
                            <input type="number" step="any" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} required className="w-1/2 bg-gray-800 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="number" step="any" placeholder="Longitude" value={lon} onChange={e => setLon(e.target.value)} required className="w-1/2 bg-gray-800 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <input type="number" placeholder="Radius (meters)" value={radius} onChange={e => setRadius(e.target.value)} required className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="flex space-x-2">
                            <button type="submit" className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Save Fence</button>
                            <button type="button" onClick={cancelAdd} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setShowAddForm(true)} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Add New Fence
                    </button>
                )}
                 {!showAddForm && <p className="text-xs text-gray-400 text-center mt-2">Click on the map to set coordinates for a new fence.</p>}
            </div>
        </div>
    );
};
