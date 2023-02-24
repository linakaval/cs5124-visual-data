class Scatterplot {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 600,
        containerHeight: _config.containerHeight || 400,
        margin: _config.margin || {top: 25, right: 10, bottom: 20, left: 30},
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales
      vis.colorScale = d3.scaleOrdinal()
          .range(['#f38874', '#89cff0']) // pink and green
          .domain(['exoplanet','milkyway']);
  
      vis.xScale = d3.scaleLog()
          .range([0, vis.width]);

  
      vis.yScale = d3.scaleLog()
          .range([vis.height, 0]);
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale)
          .tickFormat("")
          .ticks(6)
          .tickSizeOuter(0);  
          //.tickSize(-vis.height - 10)
          //.tickPadding(10);
          //.tickFormat(d => d + ' km');
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .tickFormat("")
          .ticks(6)
          //.tickSize(-vis.width - 10)
          .tickSizeOuter(0)
          .tickPadding(10);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis')
          .attr('id', 'scatter_yaxis');

  
      // Append both axis titles
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('y', vis.height + 10)
          .attr('x', vis.width/2)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Radius');
  
      vis.svg.append('text')
          .attr('class', 'axis-title')
          .attr('x', 0-vis.height/2)
          .attr('y', 10)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .attr("transform", "rotate(-90)")
          .text('Mass');
          
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
      let vis = this;
      
      // Specify accessor functions
      vis.colorValue = d => d.type;
      vis.xValue = d => d.radius;
      vis.yValue = d => d.mass;
  
      // Set the scale input domains
      //vis.xScale.domain(d3.extent(vis.data, vis.xValue));
      //vis.yScale.domain(d3.extent(vis.data, vis.yValue));
      vis.xScale.domain([0.1, d3.max(vis.data, vis.xValue)]);
      vis.yScale.domain([0.001, d3.max(vis.data, vis.yValue)]);
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements.
     */
    renderVis() {
      let vis = this;
  
      // Add circles
      const circles = vis.chart.selectAll('.point')
          .data(vis.data, d => d.trail)
        .join('circle')
          .attr('class', 'point')
          .attr('r', 4)
          .attr('cy', d => vis.yScale(vis.yValue(d)))
          .attr('cx', d => vis.xScale(vis.xValue(d)))
          //.attr('fill', '#f38874');
          .attr('fill', d => vis.colorScale(vis.colorValue(d)));
  
      // Tooltip event listeners
      circles
          .on('mouseover', (event,d) => {
            d3.select('#tooltip')
              .style('opacity', '1')
              .style('display', 'block')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
              .html(`
                <div class="tooltip-title">${d.object}</div>
                <ul>
                  <li>Radius: ${d.radius} Earth Radius</li>
                  <li>Mass: ${d.mass} Earth Mass</li>
                  <li>Type: ${d.type}</li>
                </ul>
              `);
          })
          .on('mouseleave', () => {
            d3.select('#tooltip')
               .style('display', 'none');
          });
      
      // Update the axes/gridlines
      // We use the second .call() to remove the axis and just show gridlines
      vis.xAxisG
          .call(vis.xAxis)
          // .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          // .call(g => g.select('.domain').remove())
    }
  }