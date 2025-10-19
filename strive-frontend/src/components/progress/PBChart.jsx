// PBChart.jsx

// Imports
import { useState } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Function Imports
import { calculatePersonalBests } from '../../utils/pbDetection.js';
import { kgToLbs, getWeightUnit } from '../../utils/weightUnits.js';

// Register Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MUSCLE_GROUPS = [
    'All', 
    'Chest', 
    'Back', 
    'Arms', 
    'Legs', 
    'Shoulders', 
    'Core', 
    'Full body', 
    'Other'
];

const PBChart = ({ workouts, useImperial }) => {
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');

    const exercisePBs = calculatePersonalBests(workouts);

    const weightUnit = getWeightUnit(useImperial);

    // Filter by selected muscle group
    const filteredExercises = Object.entries(exercisePBs).filter(([name, data]) => {
        if (selectedMuscleGroup === 'All') return true;
        return data.muscleGroup === selectedMuscleGroup;
    });

    // Prepare data for chart
    const labels = filteredExercises.map(([name]) => name);
    const weights = filteredExercises.map(([, data]) => 
        useImperial ? kgToLbs(data.weight) : data.weight
    );
    const dates = filteredExercises.map(([, data]) => data.date);

    const data = {
        labels,
        datasets: [
        {
            label: `Personal Best (${weightUnit})`,
            data: weights,
            backgroundColor: '#EF233C'
        },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const index = context.dataIndex;
                        const weight = context.parsed.y.toFixed(1);
                        const date = dates[index];
                        return ` ${weight} ${weightUnit} (on ${new Date(date).toLocaleDateString()})`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: { color: '#EDF2F4' },
                grid: { color: 'rgba(237, 242, 244, 0.3)' },
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#EDF2F4' },
                grid: { color: 'rgba(237, 242, 244, 0.3)' },
                title: {
                    display: true,
                    text: `Weight (${weightUnit})`,
                    color: '#EDF2F4',
                },
            },
        },
    };

    // Handle case with no exercises
    if (Object.keys(exercisePBs).length === 0) {
        return (
        <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10 text-center text-[#EDF2F4]">
            <p>No exercises found</p>
        </div>
        );
    }

    return (
        <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10">
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4 text-center">
                Personal Bests
            </h2>

            {/* Dropdown Menu */}
            <select className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-6 outline-none" value={selectedMuscleGroup} onChange={(e) => setSelectedMuscleGroup(e.target.value)}>
                <option value="">Select a Muscle Group</option>
                {MUSCLE_GROUPS.map((group) => (
                    <option key={group} value={group}>
                        {group}
                    </option>
                ))}
            </select>

            {/* Chart Area */}
            <div className="relative h-[300px] md:h-[400px]">
                {labels.length === 0 ? (
                <div className="text-center text-[#EDF2F4] py-8">
                    <p>No exercises found for {selectedMuscleGroup}</p>
                </div>
            ) : (
                <div className="h-[300px] md:h-[400px] relative">
                    <Bar data={data} options={options} />
                </div>
            )}
            </div>
        </div>
    );
};

// Export
export default PBChart;