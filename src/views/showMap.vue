<template>
    <div class="page">
        <!-- Header -->
        <mt-header fixed title="地图">
            <mt-button icon="back" slot="left" @click="back('/taskDetail')"></mt-button>
        </mt-header>
    
        <div class="container-top" style="overflow-x: auto;">
                    
             <iframe style="width:100%;height:100%;" :src="mapUrl"></iframe>

        </div>

    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
export default {
    data () {
        return {
            mapUrl:''

        }
    },
    methods: {
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            self.mapUrl = Tokens.fetch("mapUrl");
            alertShow(self.mapUrl)
            next()
        },
        deactivate ({ next }) {
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            next()
        },
        activate({to, from, next}) {
            let self = this
            next()
        }
    },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
   
</style>
