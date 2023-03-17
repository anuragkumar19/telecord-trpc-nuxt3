import { folderName } from '../constants'
import { cloudinary } from '../services/cloudinary'

const imageSizes = [
    { name: 'mobile', width: 480 },
    { name: 'tablet', width: 960 },
    { name: 'desktop', width: 1280 },
    { name: 'large-desktop', width: 1920 },
] as const

const videoQualities = [
    { name: 'low', height: 360 },
    { name: 'medium', height: 480 },
    { name: 'high', height: 720 },
    { name: 'full_hd', height: 1080 },
] as const

const videoFormats = ['mp4', 'avi', 'WebM', 'mkv'] as const
const imageFormats = ['webp', 'png', 'jpg'] as const

export const generateCloudinaryImageLinks = (publicId: string) => {
    return imageSizes.map((size) => {
        return {
            size,
            formats: imageFormats.map((format) => {
                return {
                    format,
                    links: cloudinary.url(folderName + '/' + publicId, {
                        type: 'private',
                        sign_url: true,
                        resource_type: 'image',
                        width: size.width,
                        format: format,
                    }),
                }
            }),
        }
    })
}

export const generateCloudinaryVideoLinks = (publicId: string) => {
    return videoQualities.map((size) => {
        return {
            size,
            formats: videoFormats.map((format) => {
                return {
                    format,
                    links: cloudinary.url(folderName + '/' + publicId, {
                        type: 'private',
                        sign_url: true,
                        resource_type: 'video',
                        height: size.height,
                        format: format,
                    }),
                }
            }),
        }
    })
}
