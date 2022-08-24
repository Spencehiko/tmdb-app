<template>
	<div class="chart-wrapper">
		<el-select
			class="chart-wrapper__select"
			v-model="selectType"
			placeholder="Select"
			@change="handleChange"
		>
			<el-option
				v-for="item in selectOptions"
				:key="item.value"
				:label="item.label"
				:value="item.value"
			>
			</el-option>
		</el-select>
		<div id="movieChart"></div>
		<el-pagination
			class="chart-wrapper__pagination"
			background
			layout="prev, pager, next"
			:total="totalResults"
			:page-size="20"
			:hide-on-single-page="true"
			:current-page.sync="page"
			@current-change="handleCurrentChange"
		>
		</el-pagination>
	</div>
</template>

<script>
import Highcharts from "highcharts";
import axios from "axios";

export default {
	data() {
		return {
			options: {
				chart: {
					renderTo: "movieChart",
					type: "column",
				},
				title: {
					text: "Top Movies",
				},
				subtitle: {
					text: "",
				},
				xAxis: {
					categories: [],
				},
				yAxis: {
					min: 8.4,
					tickInterval: 0.1,
				},
				tooltip: {
					crosshairs: true,
					shared: true,
				},
				plotOptions: {
					spline: {
						marker: {
							radius: 4,
							lineColor: "#666666",
							lineWidth: 1,
						},
					},
					series: {
						allowPointSelect: true,
						colorByPoint: true,
					},
				},
				series: [],
			},
			page: 1,
			totalResults: 0,
			selectOptions: [
				{
					label: "Vote Average High to Low",
					value: "top_rated#1",
				},
				{
					label: "Vote Average Low to High",
					value: "top_rated#0",
				},
				{
					label: "Popularity High to Low",
					value: "popular#1",
				},
				{
					label: "Popularity Low to High",
					value: "popular#0",
				},
			],
			selectType: "top_rated#1",
			endpoint: "top_rated",
			sort: 1,
		};
	},
	methods: {
		async updateChart() {
			await axios
				.get(
					"https://api.themoviedb.org/3/movie/" +
						this.endpoint +
						"?api_key=550629ee2fb422a5df8c8ea1db160f2a&page=" +
						(this.sort == 1 ? this.page : 501 - this.page)
				)
				.then((response) => {
					const { results, total_results } = response.data;
					this.totalResults = total_results >= 10000 ? 10000 : total_results; // page must be less than or equal to 500
					const data = [];
					const dataNames = [];
					results.forEach((result) => {
						data.push(
							this.endpoint === "top_rated"
								? result.vote_average
								: result.popularity
						);
						dataNames.push(result.title);
					});
					data.sort((a, b) => b - a);
					if (this.endpoint === "top_rated") {
						this.options.yAxis.tickInterval = 0.1;
					} else if (this.endpoint === "popular") {
						this.options.yAxis.tickInterval = 10;
					}
					if (this.sort == 1) {
						this.options.xAxis.categories = dataNames;
						this.options.yAxis.min =
							data[data.length - 1] - this.options.yAxis.tickInterval;
						this.options.series = [
							{
								showInLegend: false,
								name:
									this.endpoint === "top_rated"
										? "Movie Rating"
										: "Movie Popularity",
								data: data,
							},
						];
					} else {
						this.options.xAxis.categories = dataNames.reverse();
						this.options.yAxis.min =
							data[data.length - 1] - this.options.yAxis.tickInterval;
						this.options.series = [
							{
								name: "Movie Rating",
								data: data.reverse(),
							},
						];
					}
					this.options.yAxis.min =
						this.options.yAxis.min < 0 ? 0 : this.options.yAxis.min;
					this.options.title.text =
						this.endpoint === "top_rated"
							? "Top Rated Movies"
							: "Most Popular Movies";
					console.log("opt", this.options);
					Highcharts.chart("movieChart", this.options);
				});
		},
		handleCurrentChange(change) {
			this.page = change;
			this.updateChart();
		},
		handleChange(change) {
			const changeSplit = change.split("#");
			this.endpoint = changeSplit[0];
			this.sort = changeSplit[1];
			this.options.title.text = "data";
			this.page = 1;
			this.updateChart();
		},
	},
	mounted() {
		this.updateChart();
	},
};
</script>
<style lang="less">
.chart-wrapper {
	width: 100%;
	padding: 0 100px;
	&__select {
		margin-bottom: 30px;
	}
	&__pagination {
		margin-top: 30px;
		text-align: center;
	}
}
</style>
