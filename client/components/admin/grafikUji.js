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

export default function GrafikUji() {
	// Data historis penjualan
	const dataTraining = [30, 45, 25, 28, 35, 42, 26, 39, 33, 45]
	const dataTesting = [27, 29, 41]

	// Prediksi dari model LSTM
	const lstmPredictions = [48, 52]

	// Gabungkan data aktual
	const actualData = [...dataTraining, ...dataTesting]

	// Data untuk grafik
	const chartData = {
		labels: Array.from({length: actualData.length + lstmPredictions.length}, (_, i) => `Minggu ${i + 1}`),
		datasets: [
			{
				label: 'Data Aktual',
				data: actualData,
				borderColor: 'blue',
				fill: false,
			},
			{
				label: 'Prediksi Model (LSTM)',
				data: [...actualData, ...lstmPredictions], // Prediksi hanya untuk data testing
				borderColor: 'red',
				fill: false,
			},
			{
				label: 'Aktual',
				data: [...actualData, 50, 55], // Prediksi hanya untuk data testing
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
				text: 'Perbandingan Data Aktual vs Prediksi Penjualan',
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Minggu',
				},
			},
			y: {
				title: {
					display: true,
					text: 'Jumlah Penjualan',
				},
			},
		},
	}

	return (
		<div>
			<h2>Grafik Perbandingan Data Aktual vs Prediksi</h2>
			<Line data={chartData} options={options} />
		</div>
	)
}
