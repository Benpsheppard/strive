// ExerciseProgressChart.jsx

// Imports
import { useState, useMemo } from 'react';
import { 
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Function Imports
import { getWeightUnit, kgToLbs } from '../../utils/weightUnits';

// Register Chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ExerciseProgressChart = ({ workouts, useImperial }) => {
    const [selectedExercise, setSelectedExercise] = useState('');

    // Extract all unique exercises
    const allExercises = useMemo(() => {
        const names = new Set();
        workouts.forEach((w) => w.exercises.forEach((ex) => names.add(ex.name)));
        return Array.from(names);
    }, [workouts]);

    // Get the weight unit for labels
    const weightUnit = getWeightUnit(useImperial);

    // Filter data for the selected exercise
    const exerciseData = useMemo(() => {
        if (!selectedExercise) return [];
        const dataPoints = [];

        workouts.forEach((w) => {
            const found = w.exercises.find((ex) => ex.name === selectedExercise);
            if (found) {
                const weights = found.sets.map((s) => Number(s.weight) || 0);
                const maxWeight = Math.max(...weights);
                const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
                
                dataPoints.push({
                    date: new Date(w.createdAt).toLocaleDateString(),
                    maxWeight: useImperial ? kgToLbs(maxWeight) : maxWeight,
                    avgWeight: useImperial ? kgToLbs(avgWeight) : avgWeight,
                });
            }
        });

        return dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [selectedExercise, workouts, useImperial]);

    // Chart data
    const data = {
        labels: exerciseData.map((d) => d.date),
        datasets: [
            {
                label: `Personal Best (${weightUnit})`,
                data: exerciseData.map((d) => d.maxWeight),
                backgroundColor: '#EF233C',
                borderColor: '#EF233C',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: `Average Weight (${weightUnit})`,
                data: exerciseData.map((d) => d.avgWeight),
                backgroundColor: '#EDF2F4',
                borderColor: '#EDF2F4',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: { color: '#EDF2F4' },
                grid: { color: 'rgba(255,255,255,0.1)' },
            },
            y: {
                ticks: { color: '#EDF2F4' },
                grid: { color: 'rgba(255,255,255,0.1)' },
            },
        },
        plugins: {
            legend: {
                labels: { color: '#EDF2F4' },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(1)} ${weightUnit}`,
                },
            },
        },
    };

    return (
        <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10">
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4 text-center">
                Exercise Progress
            </h2>

            {/* Dropdown Menu */}
            <select className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-6 outline-none" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                <option value="">Select an exercise</option>
                {allExercises.map((name) => (
                <option key={name} value={name}>
                    {name}
                </option>
                ))}
            </select>

            {/* Chart Area */}
            <div className="relative h-[300px] md:h-[400px]">
                {selectedExercise && exerciseData.length > 0 ? (
                <Line data={data} options={options} />
                ) : (
                <p className="text-center text-[#EDF2F4] opacity-70">
                    Select an exercise to view your progress
                </p>
                )}
            </div>
        </div>
    );
};

// Export
export default ExerciseProgressChart;