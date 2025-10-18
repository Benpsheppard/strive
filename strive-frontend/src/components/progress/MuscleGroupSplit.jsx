import { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { kgToLbs, getWeightUnit } from '../../utils/weightUnits.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const MuscleGroupSplit = ({ workouts, useImperial }) => {
  const [viewMode, setViewMode] = useState('exercises'); // 'exercises', 'sets', or 'weight'

  // Count muscle groups based on selected view mode
  const muscleGroupCounts = {};

  // Get weight unit
  const weightUnit = getWeightUnit(useImperial);

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const muscleGroup = exercise.musclegroup;
      
      if (viewMode === 'exercises') {
        // Count each exercise once
        muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + 1;
      } else if (viewMode === 'sets') {
        // Count by number of sets
        const setCount = exercise.sets?.length || 0;
        muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + setCount;
      } else if (viewMode === 'weight') {
        // Sum total weight lifted
        const totalWeight = exercise.sets?.reduce((sum, set) => {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseFloat(set.reps) || 0;
          return sum + (weight * reps);
        }, 0) || 0;
        muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + totalWeight;
      }
    });
  });

  // Calculate total and percentages
  const total = Object.values(muscleGroupCounts).reduce((sum, count) => sum + count, 0);
  const muscleGroupData = Object.entries(muscleGroupCounts)
    .map(([group, count]) => ({
      group,
      count,
      // Convert weight for display if needed
      displayCount: (viewMode === 'weight' && useImperial) ? kgToLbs(count) : count,
      percentage: ((count / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  const colors = [
    '#EF233C', // Bright red
    '#D90429', // Deep red
    '#8D99AE', // Gray-blue
    '#2B2D42', // Dark navy
    '#EDF2F4', // Light gray-white
    '#4ECDC4', // Teal
    '#F4A261', // Warm amber
    '#6A4C93'  // Muted violet
  ];


  // Prepare chart data
  const labels = muscleGroupData.map((item) => item.group);
  const dataValues = muscleGroupData.map((item) => item.count);
  const backgroundColors = muscleGroupData.map((_, index) => colors[index % colors.length]);

  const data = {
    labels,
    datasets: [
      {
        label: viewMode === 'exercises' ? 'Exercises' : viewMode === 'sets' ? 'Sets' : 'Total Weight',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: '#2B2D42',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#EDF2F4',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const count = muscleGroupData[index].displayCount;
            const percentage = muscleGroupData[index].percentage;
            let unit;
            if (viewMode === 'exercises') unit = 'exercises';
            else if (viewMode === 'sets') unit = 'sets';
            else unit = weightUnit;
            
            const displayValue = viewMode === 'weight' ? count.toFixed(1) : count;
            return ` ${displayValue} ${unit} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Handle case with no exercises
  if (muscleGroupData.length === 0) {
    return (
      <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10 text-center text-[#EDF2F4]">
        <p>No exercises found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10">
      <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4 text-center">
        Muscle Group Split
      </h2>

      {/* Toggle between exercises, sets, and weight */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'exercises'
              ? 'bg-[#EF233C] text-[#EDF2F4]'
              : 'bg-[#2B2D42] text-[#EDF2F4] hover:bg-opacity-80'
          }`}
          onClick={() => setViewMode('exercises')}
        >
          By Exercises
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'sets'
              ? 'bg-[#EF233C] text-[#EDF2F4]'
              : 'bg-[#2B2D42] text-[#EDF2F4] hover:bg-opacity-80'
          }`}
          onClick={() => setViewMode('sets')}
        >
          By Sets
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'weight'
              ? 'bg-[#EF233C] text-[#EDF2F4]'
              : 'bg-[#2B2D42] text-[#EDF2F4] hover:bg-opacity-80'
          }`}
          onClick={() => setViewMode('weight')}
        >
          By Weight
        </button>
      </div>

      {/* Chart Area */}
      <div className="relative h-[350px] md:h-[450px] flex items-center justify-center">
        <Pie data={data} options={options} />
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {muscleGroupData.map((item, index) => (
          <div key={item.group} className="bg-[#2B2D42] p-3 rounded-lg" style={{ borderLeft: `4px solid ${backgroundColors[index]}` }}>
            {/* Muscle Group Name */}
            <div className="text-[#EDF2F4] font-semibold text-sm">{item.group}</div>
            {/* Muscle Group Percentage */}
            <div className="text-[#EDF2F4] text-lg font-bold">{item.percentage}%</div>
            {/* Muscle Group Exercise / Set / Weight count*/}
            <div className="text-[#EDF2F4] text-xs opacity-80">
              {viewMode === 'weight' 
                ? `${item.displayCount.toFixed(1)} ${weightUnit}` 
                : `${item.count} ${viewMode === 'exercises' ? 'exercises' : 'sets'}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MuscleGroupSplit;