


<template>

<div id="app">
<v-ons-page>
   <v-ons-toolbar class="toolbar1 toolbar toolbar-material">
     <div class="left"><ons-toolbar-button class="toolbar-button" @click="carouselIndex = 0">
     <i :style="(carouselIndex != 1 ? 'display:none':'')" class="zmdi zmdi-chevron-left"></i>
     </ons-toolbar-button></div>
     <div class="center">{{titles[carouselIndex]}}
     </div>
     <div class="right" >
     <ons-toolbar-button class="toolbar-button" @click="carouselIndex < 2 && carouselIndex++">
     <i v-if="carouselIndex == 0" class="zmdi zmdi-chevron-right"></i>
     </ons-toolbar-button></div>
   </v-ons-toolbar>


     <v-ons-row>
       <ul class="list" style="width:100%" v-for="(i,index) in nimet">
       <li class="list-item" v-for="a in nimet[index]"
        :style="(index!=carouselIndex?'display:none':'')">
       <div class="list-item__center">
       <div style="width:50%;max-width:200px;">{{a.Etunimi}}</div>
       <div style="width:50%;max-width:200px;">{{a.Lukumäärä}}</div>
       </div>
       <div class="list-item__right">
       <div class="range range--material">
         <input :id="(a.Etunimi)" type="range" class="range__input range--material__input" min="0" max="100">
         <!-- <input type="range" class="range__focus-ring range--material__focus-ring"> -->
       </div>
       </div>
       </li>
       </ul>
      </v-ons-row>


       <v-ons-row >
       <v-ons-col v-for="(da, index) in data">
       <pre v-for="d in da">{{d.nimi}} - {{d.pisteet}}</pre>
       </v-ons-col>
       </v-ons-row>

       <v-ons-bottom-toolbar class="toolbar bottom-bar">
       <button @click="modalVisible=true" v-if="carouselIndex != 2"
        class="toolbar-button button--material--flat">
        <i class="zmdi zmdi-odnoklassniki"></i> {{kuka == '' ? 'Kuka ': ''}}
       </button>
       <button v-if="carouselIndex != 2" class="toolbar-button button--material--flat" @click="saveData">
       <i class="zmdi zmdi-favorite"></i>
       Tilasto
       </button>

       <span class="toolbar__left">
       <button v-if="carouselIndex == 2" class="toolbar-button button--material--flat" @click="carouselIndex=1">
       <i class="zmdi zmdi-cloud-upload"></i>
       Talleta
       </button>
       </span>

       <span class="toolbar__right">
       <button v-if="carouselIndex == 2" class="toolbar-button button--material--flat" @click="carouselIndex=1">
       <i class="zmdi zmdi-ruler"></i>
       Paluu
       </button>
       </span>

       <v-ons-dialog cancelable :visible.sync="modalVisible">
             <p style="text-align: center">Kuka arvioi nimiä?</p>
             <div style="padding:20px; 0px">
             <input v-model="kuka" type="text" class="text-input text-input--underbar" placeholder="oma nimesi"></div>
             <div class="alert-dialog-footer">
       <button @click="login" class="alert-dialog-button alert-dialog-button--primal">OK</button>
     </div>
       </v-ons-dialog>
       </v-ons-bottom-toolbar>



 </v-ons-page>
</div>
</template>

<script>
import mies from './mies.json';
import nainen from './nainen.json';
import Modal from './Modal.vue'

export default {
  name: 'app',
  components: { Modal },
  data () {
    return {
      kuka: '',
      titles: [ 'Poikavauva', 'Tyttövauva', 'Vastauksesi' ],
      msg: 'Virsiä',
      carouselIndex: 0,
      items: {
        "Ladataan miesten nimiä": '#085078',
        "Ladataan naisten nimiä": '#D38312'
      },
      nimet: [ mies, nainen, [] ] ,
      data: [],
      modalVisible: false
    }
    },
    methods: {
      saveData: function() {
        var data1 = [];
        for(var d of mies) {
          data1.push( { nimi: d.Etunimi,
                            pisteet: document.getElementById(d.Etunimi).value });
        }
        data1.sort(function(a,b){return b.pisteet - a.pisteet});
        var data2 = [];
        for(var d of nainen) {
          data2.push( { nimi: d.Etunimi,
                            pisteet: document.getElementById(d.Etunimi).value });
        }
        data2.sort(function(a,b){return b.pisteet - a.pisteet});
        this.data = [ data1, data2 ];
        this.carouselIndex = 2;
      },
      showModal: function() { this.modalVisible = true;},
      login: function() {
        this.modalVisible = false;
      }
    }
  }

</script>







<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
.logo {
  max-height:30px;
}
pre {
  font-size: 0.7em;
  line-height: 0.2em;
}
.toolbar1 .zdmi {
  font-size: 1.5em !important;
}
</style>
