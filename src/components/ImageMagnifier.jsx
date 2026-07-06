import React, { useState } from 'react';

/**
 * ImageMagnifier component for premium image zoom effects.
 */
const ImageMagnifier = ({
  src,
  alt = 'Product image',
  className = '',
  magnifierHeight = 160,
  magnifyingWidth = 160,
  zoomLevel = 2.5
}) => {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setImgSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseEnter = (e) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setImgSize([width, height]);
    setShowMagnifier(true);
  };

  const handleMouseMove = (e) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // calculate cursor position on image
    const cursorX = e.pageX - left - window.scrollX;
    const cursorY = e.pageY - top - window.scrollY;

    setXY([cursorX, cursorY]);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover select-none"
        style={{ pointerEvents: 'none' }}
      />

      {showMagnifier && (
        <div
          style={{
            display: '',
            position: 'absolute',

            // prevent magnifier from filtering mouse events
            pointerEvents: 'none',
            // set size of magnifier
            height: `${magnifierHeight}px`,
            width: `${magnifyingWidth}px`,
            // move magnifier to cursor position
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifyingWidth / 2}px`,
            opacity: '1',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            borderRadius: '50%',
            backgroundColor: 'white',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',

            //calculate zoomed image size
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,

            //calculate position of zoomed image
            backgroundPositionX: `${-x * zoomLevel + magnifyingWidth / 2}px`,
            backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
