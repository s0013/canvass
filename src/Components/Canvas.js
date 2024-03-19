import React, { useEffect, useRef, useState } from 'react';
import { ChromePicker } from 'react-color';
import templateData from '../templateData.json';

const Canvas = () => {
  const { caption, cta, image_mask, urls } = templateData;
  const canvasRef = useRef(null);
  const [bgColor, setBgColor] = useState('#0369A1');
  const [lastColors, setLastColors] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const patternImg = new Image();
    patternImg.src = urls.design_pattern;
    patternImg.onload = () => {
      const pattern = ctx.createPattern(patternImg, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (selectedImage) {
        const maskImg = new Image();
        maskImg.src = selectedImage;
        maskImg.onload = () => {
          ctx.drawImage(maskImg, image_mask.x, image_mask.y, image_mask.width, image_mask.height);

          const strokeImg = new Image();
          strokeImg.src = urls.stroke;
          strokeImg.onload = () => {
            ctx.drawImage(strokeImg, image_mask.x, image_mask.y, image_mask.width, image_mask.height);

            ctx.font = `${caption.font_size}px Arial`;
            ctx.fillStyle = caption.text_color;
            ctx.textAlign = caption.alignment;
            const lines = wrapText(ctx, captionText || caption.text, caption.max_characters_per_line, true);
            lines.forEach((line, index) => {
              ctx.fillText(line, caption.position.x, caption.position.y + index * caption.font_size);
            });

            ctx.font = `${cta.font_size || 30}px Arial`;
            ctx.fillStyle = cta.text_color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillRect(cta.position.x, cta.position.y - 24, 200, 48);
            ctx.fillStyle = cta.background_color;
            ctx.fillText(ctaText || cta.text, cta.position.x + 100, cta.position.y);
          };
        };
      }
    };
  }, [bgColor, captionText, ctaText, urls, caption, cta, image_mask, selectedImage]); 

  function wrapText(context, text, maxWidth, singleLineText) {
    if (singleLineText) {
      return [text]; 
    }

    let words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      let word = words[i];
      let width = context.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    return lines; 
  }

  const handleColorChange = (color) => {
    setLastColors((prevColors) => {
      const updatedColors = [...prevColors.slice(-4), color.hex];
      return updatedColors;
    });
  };

  const handleColorSelection = (color) => {
    setBgColor(color);
  };

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
        <canvas ref={canvasRef} width={1080} height={1080} />
      </div>
      <div>
        <div>
          <label className=' bg-red-600 text-black'>First Choose File</label>
          <br></br>
          <input type="file" accept="image/*" onChange={handleImageSelection} />
        <div>
          {lastColors.map((color, index) => (
            <div key={index} style={{ backgroundColor: color, width: '20px', height: '20px', display: 'inline-block', margin: '0 5px', cursor: 'pointer' }} onClick={() => handleColorSelection(color)}></div>
          ))}
          <button
            onClick={() => setShowColorPicker(true)}
            style={{
              padding: '5px 10px',
              fontSize: '1.2rem',
              backgroundColor: '#0369A1',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            +
          </button>
          {showColorPicker && (
            <ChromePicker color={bgColor} onChange={handleColorChange} />
          )}
        </div>
          <br></br>
          <label htmlFor="captionText">Caption:</label>
          <input
            id="captionText"
            type="text"
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            className="border border-gray-300 px-2 py-1 rounded-lg mr-2"
            placeholder="Enter caption text"
          />
        </div>
        <div>
          <label htmlFor="ctaText">CTA Text:</label>
          <input
            id="ctaText"
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="border border-gray-300 px-2 py-1 rounded-lg"
            placeholder="Enter CTA text"
          />
        </div>
        
      </div>
    </div>
  );
};

export default Canvas;
