class Deltatracker{

    private lastTime: number | undefined
    
    public getAndUpdateDelta(){

        if(this.lastTime == null){
            this.lastTime = this.getTimestampMS()
            return 0
        }

        const currentTime = this.getTimestampMS()
        //Delta is the time since last frame seconds
        const delta = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime

        return delta

    }

    private getTimestampMS(){
        return (new Date()).getTime()
    }

}

export default Deltatracker