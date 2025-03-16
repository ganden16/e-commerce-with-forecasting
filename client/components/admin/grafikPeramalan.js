import React from 'react'
import {Line} from 'react-chartjs-2'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
)

export default function GrafikPeramalan({
	y1 = [], y2 = [], y3 = [],
	y1Label = '', y2Label = '', y3Label = '',
	xText = '', yText = '',
	labelsChartData = null
}) {
	// const trainTestData = [30, 45, 25, 28, 35, 42, 26, 39, 33, 45, 27, 29, 41]

	// const forecastData = [48, 52, 45]

	// const actualData = [51, 56]

	// Data untuk grafik
	const chartData = {
		labels: labelsChartData,
		datasets: [
			{
				display: false,
				label: y1Label,
				data: y1,
				borderColor: 'blue',
				fill: false,
			},
			{
				label: y2Label,
				data: [...y1, ...y2],
				borderColor: 'red',
				fill: false,
			},
			{
				label: y3Label,
				data: [...y1, ...y3], // Prediksi hanya untuk data testing
				borderColor: 'green',
				fill: false,
			},
		],
	}

	// Konfigurasi grafik
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				// text: 'Perbandingan Data Aktual vs Prediksi Penjualan',
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: xText,
				},
			},
			y: {
				title: {
					display: true,
					text: yText,
				},
			},
		},
	}

	return (
		<div>
			<Line data={chartData} options={options} />
		</div>
	)
}
