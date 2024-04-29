import { useEffect, useRef, useState, DragEvent, MouseEvent, ChangeEvent } from "react";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { hiddenInput, centerContents, overlay, hoverOverlay, padContents, imageCanvas, emptyCanvas } from "./ImageInput.module.css";

export interface ImageUploadWidgetProps {
    onChange: (file: File | null) => void,
    defaultValue?: File | string,
};

function ImageInput({ onChange, defaultValue }: ImageUploadWidgetProps) {
    const canvasRef = useRef(null as null | HTMLCanvasElement);
    const inputRef = useRef(null as null | HTMLInputElement);
    const [hasImage, setHasImage] = useState(false);
    const [drag, setDrag] = useState(false);
    const processImageURL = async (url: string): Promise<void> => {
        const srcImg = new Image();
        srcImg.src = url;
        await new Promise(a => srcImg.addEventListener("load", a));
        const canvas = canvasRef.current!;
        canvas.width = srcImg.width;
        canvas.height = srcImg.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(srcImg, 0, 0);
        const blob: any = await new Promise(a => canvas.toBlob(a, "image/png", 1));
        setHasImage(true);
        onChange(new File([blob], "image.png", { type: "image/png" }));
    };

    const processImageFile = async (file: File | null) => {
        if (file) {
            const url = URL.createObjectURL(file);
            await processImageURL(url);
            URL.revokeObjectURL(url);
        } else {
            setHasImage(false);
            onChange(null);
        }
    };

    useEffect(() => {
        if (defaultValue) {
            if (typeof (defaultValue) === "string") {
                processImageURL(defaultValue).catch(e => {
                    console.error(e);
                    setHasImage(false);
                    onChange(null);
                    const canvas = canvasRef.current;
                    if (canvas) {
                        canvas.width = 0;
                        canvas.height = 0;
                    }
                });
            } else {
                processImageFile(defaultValue).catch(e => {
                    console.error(e);
                    setHasImage(false);
                    onChange(null);
                    const canvas = canvasRef.current;
                    if (canvas) {
                        canvas.width = 0;
                        canvas.height = 0;
                    }
                });
            }
        }
    }, []);

    const fileChangeHandle = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        processImageFile(e.target.files?.item(0) || null);
    };

    const fileDropHandler = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.items) {
            const file = Array.from(e.dataTransfer.items).find(i => i.kind === "file");
            processImageFile(file?.getAsFile() || null);
        } else {
            processImageFile(e.dataTransfer.files[0] || null);
        }
    };

    const forwardClickToInput = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (e.shiftKey) {
            e.preventDefault();
            setHasImage(false);
            onChange(null);
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = 0;
                canvas.height = 0;
            }
        } else {
            inputRef.current?.click();
        }
    };

    return (<div className={`${centerContents} ${padContents}`} onClick={forwardClickToInput} onDrop={fileDropHandler} onDragOver={e => e.preventDefault()} onDragEnter={() => setDrag(true)} onDragExit={() => setDrag(false)} >
        <div className={`${centerContents} ${hasImage && !drag ? hoverOverlay : overlay}`}>
            <h3>Click Here or Drag File to Upload</h3>
            <h4>Shift + Click to Remove the Image</h4>
        </div>
        <canvas className={hasImage ? imageCanvas: emptyCanvas} ref={canvasRef}></canvas>
        <input ref={inputRef} className={hiddenInput} type="file" accept="image/*" value={""} max={1} onChange={fileChangeHandle} />
    </div>)
}

export default ImageInput;