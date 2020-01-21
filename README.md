# How to create a simple rotating globe using JavaScript and D3.JS v5

In this tutorial I will go through how to create a simple globe with some simple functionalities using D3.JS version 5.12.0 and JS ES7
In this tutorial, we will create our globe using SVG.

## creating an SVG container and a circle
first, we need to create a circle around our globe ( the edges of our globe ).
To do so, we need to first declare the size of our globe.
```javascript
const radius = 250 //pixels
```
now, we need a container in our HTML file for our SVG. You can select this container by an id, class or the attribute itself. it is recommended that you choose your container by a unique ID.
```html
<html>
  <body>
    <div id="mySvgContainer" />
  </body>
</html>
```
now, we can select our SVG playground in our JavaScript file and create an SVG circle
```javascript
import * as d3 from 'd3'

// creating our SVG container
const svg = d3
  .select('#mySvgContainer')
  .append('svg')
  .attr('viewBox', '-25 -25 550 550')
  .attr('width', '100%')
  .attr( 'height', '100%')

// creating a circle
svg
  .append('circle')
  .attr('cx', radius)
  .attr('cy', radius)
  .attr('r', radius)
  .attr('stroke', 'white')
  .style('opacity', '0.5')
  .style('fill', 'transparent')
```
we also add 3 attributes of `viewBox`, `width` and `height` to our SVG for responsiveness. Now, if you shrink/expand your page, your circle will shrink/expand with it.
we set the circles cx and cx to the radius, so that our globe is centred.

## adding graticule

now, lets define a 3d space.  to do so, you need a `projection` and a `path` to define how should the 2d point get projected on the 3d plane, and what is the path that they should traverse in case of any movement.
```javascript
const projection = d3
  .geoOrthographic()
  .scale(radius)
  .translate([radius, radius])

const path = d3
  .geoPath()
  .projection(projection)
```

now, let's draw some graticule on our globe to really see the 3d aspect of it.
we need to first define a geoGraticule.
```javascript
const graticule = d3.geoGraticule()
```
to draw it on the screen, first we need a `<g>` (group) tag in our SVG, then we can define a `<path>` tag to draw our graticule, given that we give the `path` tag instructions on how to draw it.
```javascript
const moveGraticule = () => 
  path(
	 graticule
	   .step(['30' , '20'])
	   .extent([[-180, -80.0001], [180, 80.0001]])
	   ()
  ) 

svg
  .append('g')
  .attr('class', 'graticule')
  .append('svg:path')
  .attr('fill', 'transparent')
  .style('opacity', '0.5')
  .attr('stroke', 'gray')
  .attr('d', moveGraticule)
```
on our geoGraticule, we also defined 2 attributes of `step` and `extent`. `step` defines how far away should the horizontal and vertical lines be from each other, and `extent` defines how far should it draw the graticule lines.

we can manually rotate our graticule using `projection.rotate` function:
```javascript
projection.rotate([ 90, -30, 0 ]) // [x-degree, y-degree, z-degree]
```


## adding mouse rotation
we have a 3d globe with graticule, but we should be able to rotate our globe with the mouse. To do that, first, we need to attach mouse event listeners to our SVG container
```javascript
svg
  .on('mousedown',() =>  mouseDown())
  .on('mousemove', () =>  mouseMove()) 
  .on('mouseup', () =>  mouseUp())
```
we need to track the mouse movement, and calculate the new location of our graticule, and then refresh the paintings. the actual calculations for this is slightly complex, but you don't need to worry about it. 
```javascript
let m0 =  null
let o0 =  null
let rotate = [0, 0, 0]

// any other shapes that we add to our globe, in this function, 
// we need to define how the should be redrawn if the globe moved
const refresh = () => {
  svg.select('.graticule').selectAll('path').attr('d', (d) =>  moveGraticule(d))
}

const trackballAngles = (pt) => {
  const r =  projection.scale()
  const c =  projection.translate()
  const x = pt[0] - c[0], y =  - (pt[1] - c[1])
  const ss = x*x + y*y
  const z = r*r >  2  * ss ?  Math.sqrt(r*r - ss) : r*r /  2  /  Math.sqrt(ss)
  
  const lambda =  Math.atan2(x, z) *  180  / Math.PI
  const phi =  Math.atan2(y, z) *  180  / Math.PI
  return [lambda, phi]
}

  

// PURE FUNC

const composedRotation = (λ, ϕ, γ, δλ, δϕ) => {
  λ = Math.PI /  180  * λ
  ϕ = Math.PI /  180  * ϕ
  γ = Math.PI /  180  * γ
  δλ = Math.PI /  180  * δλ
  δϕ = Math.PI /  180  * δϕ
  const sλ =  Math.sin(λ)
  const sϕ =  Math.sin(ϕ)
  const sγ =  Math.sin(γ)
  const sδλ =  Math.sin(δλ)
  const sδϕ =  Math.sin(δϕ)
  const cλ =  Math.cos(λ)
  const cϕ =  Math.cos(ϕ)
  const cγ =  Math.cos(γ)
  const cδλ =  Math.cos(δλ)
  const cδϕ =  Math.cos(δϕ)
  const m00 =  -sδλ * sλ * cϕ + (sγ * sλ * sϕ + cγ * cλ) * cδλ
  const m01 =  -sγ * cδλ * cϕ - sδλ * sϕ
  const m10 =  - sδϕ * sλ * cδλ * cϕ - (sγ * sλ * sϕ + cγ * cλ) * sδλ * sδϕ - (sλ * sϕ * cγ - sγ * cλ) * cδϕ
  const m11 = sδλ * sδϕ * sγ * cϕ - sδϕ * sϕ * cδλ + cδϕ * cγ * cϕ
  const m20 =  - sλ * cδλ * cδϕ * cϕ - (sγ * sλ * sϕ + cγ * cλ) * sδλ * cδϕ + (sλ * sϕ * cγ - sγ * cλ) * sδϕ
  const m21 = sδλ * sγ * cδϕ * cϕ - sδϕ * cγ * cϕ - sϕ * cδλ * cδϕ
  const m22 = cδλ * cδϕ * cλ * cϕ + (sγ * sϕ * cλ - sλ * cγ) * sδλ * cδϕ - (sϕ * cγ * cλ + sγ * sλ) * sδϕ

  let γ_ ,ϕ_, λ_
  if (m01 !== 0 || m11 !==  0) {
    γ_ =  Math.atan2(-m01, m11)
    ϕ_ =  Math.atan2(-m21, Math.sin(γ_) ===  0  ? m11 /  Math.cos(γ_) :  - m01 /   Math.sin(γ_))
    λ_ =  Math.atan2(-m20, m22)
  } else {
    γ_ =  Math.atan2(m10, m00) - m21 * λ
    ϕ_ =  - m21 * Math.PI /  2
    λ_ = λ
  }

  return ([λ_ *  180  / Math.PI, ϕ_ *  180  / Math.PI, γ_ *  180  / Math.PI])
}

const mouseDown = () => {
  rotate = projection.rotate()
  m0 = trackballAngles(d3.mouse(svg._groups[0][0]))
  o0 = projection.rotate()
  d3.event.preventDefault()
}

const mouseMove = () => {
  if (m0) { // if mousedown
    const m1 =  trackballAngles(d3.mouse(svg._groups[0][0]))
    // Best rotational behavior
    const o1 =  composedRotation(o0[0], o0[1], o0[2], m1[0] - m0[0], m1[1] - m0[1])
    // Alternate way with less accuracy ( and less computation! )
    // const o1 = [o0[0] + (m1[0] - m0[0]), o0[1] + (m1[1] - m0[1])];
    // move to the updated rotation position
    projection.rotate(o1)
    rotate =  projection.rotate()
    refresh()
  }
}

const mouseUp = () => {
  if (m0) { // if mousedown
    mouseMove()
    m0 =  null
  }
}
```
after attaching the listeners, you should be able to move the globe using your cursor.

