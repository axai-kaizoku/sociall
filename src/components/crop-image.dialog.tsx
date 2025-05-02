import { useRef } from "react"
import { Cropper, type ReactCropperElement } from "react-cropper"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import "cropperjs/dist/cropper.css"

export const CropImageDialog = ({
  src,
  cropAspectRatio,
  onCropped,
  onClose,
}: {
  src: string
  cropAspectRatio: number
  onCropped: (blob: Blob | null) => void
  onClose: () => void
}) => {
  const cropperRef = useRef<ReactCropperElement>(null)

  const crop = () => {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return

    cropper?.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp")
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <Cropper
          ref={cropperRef}
          src={src}
          aspectRatio={cropAspectRatio}
          guides={false}
          zoomable={false}
          className="mx-auto size-fit"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
