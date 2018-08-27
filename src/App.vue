<template>
  <div id="app">

    <div v-for="(windowData, key) in windowsData" :key="key" class="site-wrap">
      <input
        class="site-entry"
        type="text"
        placeholder="Enter website here and press 'enter'"
        @keyup.prevent.enter="updateSites(windowData, key)"
        v-model="windowData.userInput"
      >

      <iframe 
        :id="key"
        :name="key"
        class="site"
        v-if="windowData.site"
        :src="windowData.site">
      </iframe>
    </div>

  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      windowsData: {
        a: {
          userInput: '',
          site: ''
        },
        b: {
          userInput: '',
          site: ''
        },
        c: {
          userInput: '',
          site: ''
        },
        d: {
          userInput: '',
          site: ''
        },
      },
    }
  },
  mounted () {
    chrome.storage.sync.get('windowsData', (data) => {
      if (!data.windowsData || Object.keys(data.windowsData).length === 0) return;

      this.windowsData = data.windowsData;
      this.addListeners();
    })

  },
  methods: {
    /**
     * Nullifies x-frame-options headers to allow iframe injection
     * @param details details of the HTTP request
     */
    onHeadersReceived (details) {

      if(details.initiator != window.location.origin) {
        return;
      }

      for (let index in details.responseHeaders) {

        let header = details.responseHeaders[index];

        if (header.name.toLowerCase() == 'x-frame-options' ||
            header.name.toLowerCase() == 'frame-ancestors') {

          details.responseHeaders.splice(index, 1);
          return {
            responseHeaders: details.responseHeaders
          };
        }
      }
    },

    /**
     * Adds the header listeners when the sites update
     */
    addListeners () {
      for (let key in this.windowsData) {
        const windowData = this.windowsData[key]
        if(windowData.site) {
          chrome.webRequest.onHeadersReceived.addListener(
            this.onHeadersReceived,
            { urls: [windowData.site] },
            [ "blocking", "responseHeaders" ]
          );
        }
      }
    },

    /**
     * Update the sites when changed by the user
     */
    updateSites (windowData, key) {
      const reg = new RegExp('^(http|https)://','gi');
      if (!reg.test(windowData.userInput)) {
        windowData.userInput = `https://${windowData.userInput}`
      }
      if (windowData.site && windowData.site === windowData.userInput) {
        document.getElementById(key).src = windowData.site
      }
      for (let windowData in this.windowsData) {
        if(windowData.site) {
          chrome.webRequest.onHeadersReceived.removeListener(
            this.onHeadersReceived,
            { urls: [windowData.site] },
            [ "blocking", "responseHeaders" ]
          );
        }
      }

      windowData.site = windowData.userInput;
      this.addListeners();

      chrome.storage.sync.set({
        windowsData: this.windowsData,
      }, () => {
      });

    }
  }
}
</script>

<style>
#app {
  box-sizing: border-box;
  height: 100vh;
  width: 100vw;
}

.site-wrap {
  display: flex;
  flex-direction: column;
  float: left;
}
.site-wrap:nth-child(1) {
  width: 100vw;
  height: 50vh;
}
.site-wrap:nth-child(2) {
  width: 50vw;
  height: 50vh;
}
.site-wrap:nth-child(3) {
  width: 25vw;
  height: 50vh;
}
.site-wrap:nth-child(4) {
  width: 25vw;
  height: 50vh;
}
.site-entry {
  height: min-content;
  box-sizing: border-box;
  font-size: 16px;
  padding: 8px;
  width: 100%;
}

.site {
  flex: 1;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
