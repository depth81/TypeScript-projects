class imageUtils{
    public static loadImageFromUrl(url: string): Promise<HTMLImageElement>{
        return new Promise(resolve => {
            const img = new Image()
                img.src = url
                img.onload = () => {
                resolve(img)
            }
            img.src = url
        })
    }
}

export default imageUtils