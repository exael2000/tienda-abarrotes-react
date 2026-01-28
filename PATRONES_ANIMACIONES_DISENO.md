# 🎨 PATRONES DE ANIMACIONES Y DISEÑO - REFERENCIA PROFESIONAL

> Patrones extraídos de repositorios profesionales: Chakra UI, Tailwind CSS, React Spring
> Fecha: Enero 2026

---

## 📦 CHAKRA UI - CAROUSEL PATTERNS

### 1. Carousel Básico con Indicadores
```tsx
import { Carousel, IconButton } from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

export const CarouselBasic = () => {
  const items = Array.from({ length: 5 })
  
  return (
    <Carousel.Root slideCount={items.length} maxW="md" mx="auto">
      <Carousel.ItemGroup>
        {items.map((_, index) => (
          <Carousel.Item key={index} index={index}>
            <div style={{ width: "100%", height: "300px" }}>
              Slide {index + 1}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <Carousel.Control justifyContent="center" gap="4">
        <Carousel.PrevTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronLeft />
          </IconButton>
        </Carousel.PrevTrigger>

        <Carousel.Indicators />

        <Carousel.NextTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronRight />
          </IconButton>
        </Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  )
}
```

### 2. Carousel con Autoplay
```tsx
export const CarouselWithAutoplay = () => {
  return (
    <Carousel.Root
      autoplay={{ delay: 2000 }}
      slideCount={items.length}
      mx="auto"
      maxW="xl"
    >
      <Carousel.ItemGroup>
        {items.map((_, index) => (
          <Carousel.Item key={index} index={index}>
            <div>{index + 1}</div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <Carousel.Control justifyContent="center" gap="4">
        <Carousel.PrevTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronLeft />
          </IconButton>
        </Carousel.PrevTrigger>

        <Carousel.AutoplayTrigger asChild>
          <IconButton size="sm" variant="ghost">
            <Carousel.AutoplayIndicator
              paused={<LuPause />}
              play={<LuPlay />}
            />
          </IconButton>
        </Carousel.AutoplayTrigger>

        <Carousel.NextTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronRight />
          </IconButton>
        </Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  )
}
```

### 3. Carousel Variable Size
```tsx
const items = [
  { id: "1", width: "120px", label: "Small" },
  { id: "2", width: "200px", label: "Medium Size" },
  { id: "3", width: "80px", label: "XS" },
  { id: "4", width: "250px", label: "Large Content Here" },
]

export const CarouselVariableSize = () => {
  return (
    <Carousel.Root
      slideCount={items.length}
      autoSize
      spacing="8px"
      maxW="xl"
    >
      <Carousel.ItemGroup>
        {items.map((item, index) => (
          <Carousel.Item key={index} index={index}>
            <div style={{ width: item.width }}>
              {item.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
    </Carousel.Root>
  )
}
```

### 4. Carousel con Mouse Drag
```tsx
export const CarouselWithMouseDrag = () => {
  return (
    <Carousel.Root 
      slideCount={items.length} 
      maxW="xl" 
      allowMouseDrag
    >
      <Carousel.ItemGroup>
        {items.map((_, index) => (
          <Carousel.Item key={index} index={index}>
            <div>Drag me!</div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
    </Carousel.Root>
  )
}
```

### 5. Carousel Vertical
```tsx
export const CarouselVertical = () => {
  return (
    <Carousel.Root
      orientation="vertical"
      slideCount={items.length}
      height="320px"
      maxW="xl"
    >
      <Carousel.ItemGroup flex="1">
        {items.map((_, index) => (
          <Carousel.Item key={index} index={index}>
            <div>{index + 1}</div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <Carousel.Control h="100%" justifyContent="space-between">
        <Carousel.PrevTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronUp />
          </IconButton>
        </Carousel.PrevTrigger>

        <Carousel.NextTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronDown />
          </IconButton>
        </Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  )
}
```

### 6. Skeleton Loading con Animación
```tsx
const skeletonRecipe = {
  base: {
    loading: {
      "--start-color": "colors.bg",
      "--end-color": "colors.bg.emphasized",
      backgroundImage:
        "linear-gradient(270deg, var(--start-color), var(--end-color), var(--end-color), var(--start-color))",
      backgroundSize: "400% 100%",
      animation: "bg-position var(--duration, 5s) ease-in-out infinite",
    },
    none: {
      animation: "none",
    },
  },
}

// Keyframe
const bgPosition = {
  from: {
    backgroundPosition: "var(--animate-from, 1rem) 0",
  },
  to: {
    backgroundPosition: "var(--animate-to, 0) 0",
  },
}
```

---

## 🎨 TAILWIND CSS - ANIMATION UTILITIES

### Keyframes Predefinidos
```css
/* Spin */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
/* Uso: animate-spin */

/* Ping */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
/* Uso: animate-ping */

/* Pulse */
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
/* Uso: animate-pulse */

/* Bounce */
@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
/* Uso: animate-bounce */
```

### Variables de Animación
```css
:root {
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Animaciones */
  --animate-spin: spin 1s linear infinite;
  --animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-bounce: bounce 1s infinite;

  /* Blur */
  --blur-xs: 4px;
  --blur-sm: 8px;
  --blur-md: 12px;
  --blur-lg: 16px;
  --blur-xl: 24px;

  /* Perspective */
  --perspective-dramatic: 100px;
  --perspective-near: 300px;
  --perspective-normal: 500px;
  --perspective-distant: 1200px;

  /* Transitions */
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Gradient Animations
```tsx
// Linear Gradient
const linearGradient = {
  '--tw-gradient-position': 'to right',
  backgroundImage: 'linear-gradient(var(--tw-gradient-stops))',
}

// Radial Gradient
const radialGradient = {
  '--tw-gradient-position': 'circle at center',
  backgroundImage: 'radial-gradient(var(--tw-gradient-stops))',
}

// Conic Gradient
const conicGradient = {
  '--tw-gradient-position': 'from 0deg',
  backgroundImage: 'conic-gradient(var(--tw-gradient-stops))',
}

// Gradient Stops
const gradientStops = {
  '--tw-gradient-from': '#ff0000',
  '--tw-gradient-via': '#00ff00',
  '--tw-gradient-to': '#0000ff',
  '--tw-gradient-from-position': '0%',
  '--tw-gradient-via-position': '50%',
  '--tw-gradient-to-position': '100%',
}
```

### Transform Patterns
```css
/* 3D Transforms */
.transform-3d {
  transform-style: preserve-3d;
  transform: 
    translateZ(0) 
    translateX(var(--tw-translate-x)) 
    translateY(var(--tw-translate-y))
    scale(var(--tw-scale-x), var(--tw-scale-y))
    rotate(var(--tw-rotate));
}

/* GPU Acceleration */
.transform-gpu {
  transform: translateZ(0) /* force GPU */;
}

/* Perspective */
.perspective-normal {
  perspective: 500px;
  perspective-origin: center;
}
```

### Mask Animations
```css
/* Linear Mask */
.mask-linear {
  mask-image: linear-gradient(
    var(--tw-mask-linear-position),
    var(--tw-mask-linear-from-color) var(--tw-mask-linear-from-position),
    var(--tw-mask-linear-to-color) var(--tw-mask-linear-to-position)
  );
}

/* Radial Mask */
.mask-radial {
  mask-image: radial-gradient(
    var(--tw-mask-radial-shape) var(--tw-mask-radial-size) at var(--tw-mask-radial-position),
    var(--tw-mask-radial-from-color) var(--tw-mask-radial-from-position),
    var(--tw-mask-radial-to-color) var(--tw-mask-radial-to-position)
  );
}
```

---

## ⚛️ REACT SPRING - ANIMACIONES FLUIDAS

### 1. useSpring - Animación Básica
```tsx
import { useSpring, animated } from '@react-spring/web'

const FadeIn = ({ isVisible, children }) => {
  const styles = useSpring({
    opacity: isVisible ? 1 : 0,
    y: isVisible ? 0 : 24,
  })

  return <animated.div style={styles}>{children}</animated.div>
}
```

### 2. useTransition - Lista Animada
```tsx
import { useTransition, animated } from '@react-spring/web'

export default function App() {
  const [items, setItems] = useState(['Item 1', 'Item 2'])
  
  const transitions = useTransition(items, {
    from: { opacity: 0, height: 0, transform: 'perspective(600px) rotateX(0deg)' },
    enter: [
      { opacity: 1, height: 80 },
      { transform: 'perspective(600px) rotateX(180deg)' },
      { transform: 'perspective(600px) rotateX(0deg)' },
    ],
    leave: [
      { opacity: 0 },
      { height: 0 }
    ],
  })

  return transitions((style, item) => (
    <animated.div style={style}>
      {item}
    </animated.div>
  ))
}
```

### 3. useTrail - Animación en Cadena
```tsx
import { useTrail, animated } from '@react-spring/web'

const Trail = ({ open, children }) => {
  const items = React.Children.toArray(children)
  
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: open ? 1 : 0,
    x: open ? 0 : 20,
    height: open ? 110 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  })
  
  return trail.map(({ height, ...style }, index) => (
    <animated.div key={index} style={style}>
      <animated.div style={{ height }}>
        {items[index]}
      </animated.div>
    </animated.div>
  ))
}
```

### 4. useSprings - Múltiples Animaciones
```tsx
import { useSprings, animated } from '@react-spring/web'

function Deck() {
  const [gone] = useState(() => new Set())
  
  const [props, api] = useSprings(cards.length, i => ({
    x: 0,
    y: 0,
    scale: 1,
    rot: -10 + Math.random() * 20,
    from: { x: 0, rot: 0, scale: 1.5, y: -1000 },
  }))

  const bind = useDrag(({ args: [index], down, movement: [mx], velocity }) => {
    const trigger = velocity > 0.2
    const dir = mx < 0 ? -1 : 1
    
    if (!down && trigger) gone.add(index)
    
    api.start(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0)
      const scale = down ? 1.1 : 1
      
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })
  })

  return props.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ x, y }}>
      <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans) }}>
        Card {i}
      </animated.div>
    </animated.div>
  ))
}
```

### 5. Parallax - Efecto Parallax
```tsx
import { Parallax, ParallaxLayer } from '@react-spring/parallax'

const Example = () => {
  const ref = useRef()
  
  return (
    <Parallax pages={3} ref={ref}>
      <ParallaxLayer offset={0} speed={2.5}>
        <p>First layer</p>
      </ParallaxLayer>

      <ParallaxLayer offset={1} speed={-2} factor={1.5}>
        <p>Second layer (reverse)</p>
      </ParallaxLayer>

      <ParallaxLayer sticky={{ start: 1, end: 2 }}>
        <p>Sticky layer</p>
      </ParallaxLayer>

      <ParallaxLayer offset={2} speed={1}>
        <button onClick={() => ref.current.scrollTo(0)}>
          Scroll to top
        </button>
      </ParallaxLayer>
    </Parallax>
  )
}
```

### 6. useScroll - Animación por Scroll
```tsx
import { useScroll, animated } from '@react-spring/web'

function MyComponent() {
  const { scrollYProgress } = useScroll()

  return (
    <animated.div style={{ opacity: scrollYProgress }}>
      Hello World
    </animated.div>
  )
}

// Con contenedor específico
function ScrollContainer() {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    container: containerRef,
    onChange: ({ value: { scrollYProgress } }) => {
      if (scrollYProgress > 0.7) {
        // Trigger animation
      }
    },
  })

  return (
    <div ref={containerRef}>
      <animated.div
        style={{
          clipPath: scrollYProgress.to(val => `circle(${val * 100}%)`)
        }}
      >
        Content
      </animated.div>
    </div>
  )
}
```

### 7. useChain - Orquestación de Animaciones
```tsx
import { useSpring, useTransition, useChain, useSpringRef } from '@react-spring/web'

export default function App() {
  const [open, setOpen] = useState(false)

  const springApi = useSpringRef()
  const { size, ...rest } = useSpring({
    ref: springApi,
    config: { tension: 350, friction: 40 },
    from: { size: '20%', background: 'hotpink' },
    to: {
      size: open ? '100%' : '20%',
      background: open ? 'white' : 'hotpink',
    },
  })

  const transApi = useSpringRef()
  const transition = useTransition(open ? data : [], {
    ref: transApi,
    trail: 400 / data.length,
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0 },
  })

  // Orquestar las animaciones
  useChain(
    open ? [springApi, transApi] : [transApi, springApi],
    [0, open ? 0.1 : 0.6]
  )

  return (
    <div onClick={() => setOpen(!open)}>
      <animated.div style={{ ...rest, width: size, height: size }}>
        {transition((style, item) => (
          <animated.div style={style}>{item}</animated.div>
        ))}
      </animated.div>
    </div>
  )
}
```

### 8. CSS Keyframes con React Spring
```tsx
import { useSpring, animated } from '@react-spring/web'

export default function App() {
  const [state, toggle] = useState(true)
  
  const { x } = useSpring({
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 1000 },
  })

  return (
    <animated.div
      onClick={() => toggle(!state)}
      style={{
        opacity: x.to({ range: [0, 1], output: [0.3, 1] }),
        scale: x.to({
          range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
          output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1],
        }),
      }}
    >
      Click me
    </animated.div>
  )
}
```

### 9. Exit Before Enter Pattern
```tsx
import { useTransition, useSpringRef, animated } from '@react-spring/web'

const IMAGES = ['image1.jpg', 'image2.jpg', 'image3.jpg']

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const springApi = useSpringRef()

  const transitions = useTransition(activeIndex, {
    from: {
      clipPath: 'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)',
    },
    enter: {
      clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)',
    },
    leave: {
      clipPath: 'polygon(100% 0%, 100% 100%, 100% 100%, 100% 0%)',
    },
    exitBeforeEnter: true,
    config: { duration: 4000 },
    ref: springApi,
  })

  useLayoutEffect(() => {
    springApi.start()
  }, [activeIndex])

  return transitions((springs, item) => (
    <animated.div style={springs}>
      <img src={IMAGES[item]} />
    </animated.div>
  ))
}
```

### 10. Gesture Animations (Drag & Pinch)
```tsx
import { useSpring, animated, to } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'

export default function App() {
  const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    zoom: 0,
    x: 0,
    y: 0,
    config: { mass: 5, tension: 350, friction: 40 },
  }))

  useGesture(
    {
      onDrag: ({ active, offset: [x, y] }) =>
        api.start({ x, y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.1 }),
      onPinch: ({ offset: [d, a] }) => api.start({ zoom: d / 200, rotateZ: a }),
      onMove: ({ xy: [px, py], dragging }) =>
        !dragging &&
        api.start({
          rotateX: (py - window.innerHeight / 2) / 20,
          rotateY: (px - window.innerWidth / 2) / 20,
          scale: 1.1,
        }),
      onHover: ({ hovering }) =>
        !hovering && api.start({ rotateX: 0, rotateY: 0, scale: 1 }),
    },
    { target: domTarget, eventOptions: { passive: false } }
  )

  return (
    <animated.div
      ref={domTarget}
      style={{
        transform: 'perspective(600px)',
        x,
        y,
        scale: to([scale, zoom], (s, z) => s + z),
        rotateX,
        rotateY,
        rotateZ,
      }}
    >
      Card Content
    </animated.div>
  )
}
```

---

## 🎯 PATRONES DE USO COMÚN

### 1. Fade In on Mount
```tsx
const FadeIn = ({ children }) => {
  const styles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  })
  return <animated.div style={styles}>{children}</animated.div>
}
```

### 2. Slide In from Side
```tsx
const SlideIn = ({ children, direction = 'left' }) => {
  const styles = useSpring({
    from: { 
      opacity: 0, 
      transform: `translateX(${direction === 'left' ? '-100%' : '100%'})` 
    },
    to: { 
      opacity: 1, 
      transform: 'translateX(0%)' 
    },
  })
  return <animated.div style={styles}>{children}</animated.div>
}
```

### 3. Scale on Hover
```tsx
const ScaleCard = ({ children }) => {
  const [isHovered, setHovered] = useState(false)
  
  const styles = useSpring({
    scale: isHovered ? 1.05 : 1,
    config: { tension: 300, friction: 20 },
  })

  return (
    <animated.div
      style={styles}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </animated.div>
  )
}
```

### 4. Stagger Children
```tsx
const StaggerList = ({ items }) => {
  const trail = useTrail(items.length, {
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
  })

  return trail.map((style, index) => (
    <animated.div key={index} style={style}>
      {items[index]}
    </animated.div>
  ))
}
```

### 5. Loading Skeleton
```css
.skeleton {
  background: linear-gradient(
    270deg,
    var(--skeleton-start) 0%,
    var(--skeleton-end) 50%,
    var(--skeleton-start) 100%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}
```

---

## 🔧 CONFIGURACIONES RECOMENDADAS

### React Spring Config Presets
```tsx
import { config } from '@react-spring/web'

// Configs predefinidos
config.default  // { tension: 170, friction: 26 }
config.gentle   // { tension: 120, friction: 14 }
config.wobbly   // { tension: 180, friction: 12 }
config.stiff    // { tension: 210, friction: 20 }
config.slow     // { tension: 280, friction: 60 }
config.molasses // { tension: 280, friction: 120 }

// Config personalizado
const customConfig = {
  mass: 1,          // Masa del objeto (más pesado = más lento)
  tension: 170,     // Fuerza del resorte
  friction: 26,     // Resistencia
  clamp: false,     // Detener en el valor objetivo
  precision: 0.01,  // Precisión (threejs usar 0.0001)
  velocity: 0,      // Velocidad inicial
  duration: undefined, // Duración fija (desactiva física)
  easing: t => t,   // Función de easing
}
```

### Tailwind Animation Classes
```tsx
// Utilidades de animación
'animate-spin'     // Rotación continua
'animate-ping'     // Ping effect
'animate-pulse'    // Pulse opacity
'animate-bounce'   // Bounce effect

// Transitions
'transition-all'      // Todas las propiedades
'transition-colors'   // Solo colores
'transition-opacity'  // Solo opacidad
'transition-shadow'   // Solo sombras
'transition-transform' // Solo transforms

// Durations
'duration-75'   // 75ms
'duration-100'  // 100ms
'duration-150'  // 150ms (default)
'duration-200'  // 200ms
'duration-300'  // 300ms
'duration-500'  // 500ms
'duration-700'  // 700ms
'duration-1000' // 1000ms

// Easing
'ease-linear'
'ease-in'
'ease-out'
'ease-in-out'

// Delays
'delay-75'
'delay-100'
'delay-150'
'delay-200'
'delay-300'
```

---

## 💡 MEJORES PRÁCTICAS

### 1. Performance
- Usa `will-change` para propiedades que se animarán
- Prefiere `transform` y `opacity` (GPU-accelerated)
- Evita animar `width`, `height`, `top`, `left`
- Usa `translateZ(0)` para forzar GPU

### 2. Accesibilidad
- Respeta `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. React Spring Tips
- Usa `useSpringRef` para control imperativo
- `exitBeforeEnter` para transiciones suaves
- `trail` para stagger automático
- `onRest` para callbacks al finalizar

### 4. Debugging
```tsx
// Ver valores de animación
const spring = useSpring({
  from: { x: 0 },
  to: { x: 100 },
  onChange: (result) => {
    console.log('Animation values:', result.value)
  }
})
```

---

## 📚 RECURSOS ADICIONALES

- **Chakra UI Docs**: https://chakra-ui.com/docs/components/carousel
- **Tailwind CSS Animations**: https://tailwindcss.com/docs/animation
- **React Spring**: https://www.react-spring.dev/
- **React Use Gesture**: https://use-gesture.netlify.app/

---

*Última actualización: Enero 2026*
*Fuentes: chakra-ui/chakra-ui, tailwindlabs/tailwindcss, pmndrs/react-spring*
