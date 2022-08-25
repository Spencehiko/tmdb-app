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
import moment from "moment";

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
				{
					label: "Release Date High to Low",
					value: "#3",
				},
				{
					label: "Release Date Low to High",
					value: "#2",
				},
				{
					label: "Vote Count High to Low",
					value: "#5",
				},
				{
					label: "Vote Count Low to High",
					value: "#4",
				},
			],
			selectType: "top_rated#1",
			endpoint: "top_rated",
			sort: 1,
		};
	},
	methods: {
		async updateChart() {
			let pageToShow = this.page;
			if (this.sort == 0) {
				pageToShow = 501 - pageToShow;
			}
			await axios
				.get(
					"https://api.themoviedb.org/3/movie/" +
						this.endpoint +
						"?api_key=550629ee2fb422a5df8c8ea1db160f2a&page=" +
						pageToShow
				)
				.then((response) => {
					const { results, total_results } = response.data;
					this.totalResults = total_results >= 10000 ? 10000 : total_results; // page must be less than or equal to 500
					const allData = [];
					const data = [];
					const dataNames = [];
					let dataToGet = "vote_average";
					let dataName = "Movie Rating";
					if (this.sort == 0 || this.sort == 1) {
						dataToGet =
							this.endpoint === "top_rated" ? "vote_average" : "popularity";
						dataName =
							this.endpoint === "top_rated"
								? "Movie Rating"
								: "Movie Popularity";
					} else if (this.sort == 2 || this.sort == 3) {
						dataToGet = "release_date";
						dataName = "Release Date";
					} else if (this.sort == 4 || this.sort == 5) {
						dataToGet = "vote_count";
						dataName = "Vote Count";
					}
					results.forEach((result) => {
						if (dataToGet === "release_date") {
							allData.push({
								data: +moment(result.release_date, "YYYY/MM/DD"),
								dataNames: result.title,
							});
						} else {
							allData.push({
								data: result[dataToGet],
								dataNames: result.title,
							});
						}
					});
					if (this.sort % 2 == 1) {
						allData.sort((a, b) => b.data - a.data);
					} else {
						allData.sort((a, b) => a.data - b.data);
					}
					allData.forEach((datas) => {
						data.push(datas.data);
						dataNames.push(datas.dataNames);
					});
					if (this.endpoint === "top_rated") {
						this.options.yAxis.tickInterval = 0.1;
					} else if (this.endpoint === "popular") {
						this.options.yAxis.tickInterval = 10;
					}
					this.options.xAxis.categories = dataNames;
					this.options.yAxis.min =
						data.reduce((a, b) => Math.min(a, b)) -
						this.options.yAxis.tickInterval;
					this.options.series = [
						{
							showInLegend: false,
							name: dataName,
							data: data,
						},
					];
					this.options.title.text =
						this.endpoint === "top_rated"
							? "Top Rated Movies"
							: "Most Popular Movies";
					this.options.yAxis.labels = {
						formatter: function () {
							return this.value;
						},
					};
					this.options.tooltip.formatter = function (tooltip) {
						return tooltip.defaultFormatter.call(this, tooltip);
					};
					if (dataToGet === "release_date") {
						this.options.yAxis.labels.formatter = function () {
							return moment(this.value).format("DD/MM/YYYY");
						};
						this.options.tooltip.formatter = function () {
							return (
								"<b>" +
								this.x +
								"</b></br>" +
								dataName +
								": " +
								moment(this.y).format("DD/MM/YYYY")
							);
						};
					} else {
						this.options.yAxis.min =
							this.options.yAxis.min < 0 ? 0 : this.options.yAxis.min;
					}
					Highcharts.chart("movieChart", this.options);
				});
		},
		handleCurrentChange(change) {
			this.page = change;
			this.updateChart();
		},
		handleChange(change) {
			const changeSplit = change.split("#");
			if (changeSplit[0]) {
				this.endpoint = changeSplit[0];
			}
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
