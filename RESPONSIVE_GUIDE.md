# 📱 Responsive Design Guide

## Screen Size Breakpoints

### 📱 Mobile (< 640px)
- **Navigation**: Hamburger menu with slide-down animation
- **Hero Title**: 4xl font size (36px)
- **Carousel**: 350px height, single column thumbnails
- **Stats**: 2 columns grid
- **Features**: Single column stack
- **Process**: Single column stack
- **Buttons**: Full width on mobile menu
- **Spacing**: Reduced padding (py-16)

### 📱 Tablet (640px - 768px)
- **Navigation**: Hamburger menu
- **Hero Title**: 5xl font size (48px)
- **Carousel**: 450px height
- **Stats**: 2 columns grid
- **Features**: 2 columns grid
- **Process**: 2 columns grid
- **Spacing**: Medium padding (py-20)

### 💻 Desktop (768px - 1024px)
- **Navigation**: Full horizontal menu
- **Hero Title**: 6xl font size (60px)
- **Carousel**: 550px height
- **Stats**: 4 columns grid
- **Features**: 4 columns grid
- **Process**: 2 columns grid
- **Spacing**: Full padding (py-24)

### 🖥️ Large Desktop (> 1024px)
- **Navigation**: Full menu with enhanced spacing
- **Hero Title**: 7xl font size (72px)
- **Carousel**: 550px height with enhanced effects
- **Stats**: 4 columns with larger cards
- **Features**: 4 columns with 3D effects
- **Process**: 2 columns with enhanced animations
- **Spacing**: Maximum padding (py-28)

## Responsive Features

### Images
- **Mobile**: Optimized smaller images
- **Desktop**: Full resolution with 3D effects
- **Lazy Loading**: All carousel images
- **Aspect Ratio**: Maintained across all sizes

### Typography
- **Mobile**: Base 14px, headings scale down
- **Tablet**: Base 16px, medium heading sizes
- **Desktop**: Base 16px, large heading sizes
- **Line Height**: Adjusted for readability

### Spacing
- **Container**: Max-width 1400px (2xl)
- **Padding**: Responsive (px-4 to px-8)
- **Gaps**: Scale from 4 to 8 units
- **Margins**: Proportional to screen size

### Animations
- **Mobile**: Simplified animations
- **Desktop**: Full 3D effects and GSAP animations
- **Performance**: GPU-accelerated on all devices

### Touch Interactions
- **Mobile**: Larger touch targets (min 44px)
- **Swipe**: Carousel supports touch swipe
- **Tap**: Enhanced tap feedback
- **Hover**: Converted to tap on mobile

## Testing Checklist

✅ **Mobile (375px - iPhone SE)**
- Navigation menu works
- All text is readable
- Images load properly
- Buttons are tappable
- No horizontal scroll

✅ **Tablet (768px - iPad)**
- 2-column layouts display correctly
- Navigation transitions properly
- Images scale appropriately
- Touch interactions work

✅ **Desktop (1920px)**
- Full 4-column grids
- All 3D effects active
- GSAP animations smooth
- Hover states work
- No layout breaks

✅ **Ultra-wide (2560px+)**
- Content stays centered
- Max-width container works
- No stretched elements
- Proper spacing maintained

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

## Performance Targets

- **Mobile**: < 3s load time
- **Desktop**: < 2s load time
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **FID**: < 100ms

## Accessibility

- **Keyboard Navigation**: Full support
- **Screen Readers**: ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible on all interactive elements
- **Touch Targets**: Minimum 44x44px
