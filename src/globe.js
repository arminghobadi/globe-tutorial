import * as d3 from 'd3'

const radius = 250 //pixels
let svg, projection, path, graticule


  const init = () => {
    // creating our SVG container
    svg = d3
      .select('.mySvgContainer')
      .append('svg')
      .attr('viewBox', '-25 -25 550 550')
      .attr('width', '100%')
      .attr( 'height', '100%')




    projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([radius, radius])

    path = d3
      .geoPath()
      .projection(projection)

    graticule = d3.geoGraticule()

    const moveGraticule = () => 
      path(
        graticule
          .step(['30' , '20'])
          .extent([[-180, -80.0001], [180, 80.0001]])
          ()
      ) 


    // creating a circle
    svg
      .append('circle')
      .attr('cx', radius)
      .attr('cy', radius)
      .attr('r', radius)
      .attr('stroke', 'white')
      .style('opacity', '0.5')
      .style('fill', 'transparent')
    
    svg
    .append('g')
    .attr('class', 'graticule')
    .append('svg:path')
    .attr('fill', 'transparent')
    .style('opacity', '0.5')
    .attr('stroke', 'gray')
    .attr('d', moveGraticule)
    
  
  }
  
  export const globe = {
    init
  }
