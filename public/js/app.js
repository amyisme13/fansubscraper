/* eslint-disable */

new Vue({
    el: '#app',
    data: {
        feeds: [],
        pagination: {
            page: 1,
            min: 1,
            max: 20,
        },
        provider: 'awsubs',
        selectedPost: {},
        detailLoaded: true,
    },
    methods: {
        fetchFeeds: _.debounce(function() {
            const curPage = this.pagination.page + 0;
            const curProvider = this.provider + '';
            fetch(`/${this.provider}?p=${this.pagination.page}`)
                .then(res => res.json())
                .then(json => {
                    this.feeds = json;
                    this.pagination.page = curPage;
                    this.provider = curProvider;
                });
        }, 1000),
        fetchPost: _.debounce(function(i) {
            const url = encodeURIComponent(this.feeds[i].url);
            fetch(`/${this.provider}/post/${url}`)
                .then(res => res.json())
                .then(json => {
                    this.selectedPost = json;
                    this.detailLoaded = true;
                });
        }, 1000),
        changePage(op) {
            if (op === 'prev') {
                if (this.pagination.page > this.pagination.min) {
                    this.pagination.page = this.pagination.page - 1;

                    this.feeds = [];
                    this.fetchFeeds();
                }
            } else if (op === 'next') {
                if (this.pagination.page < this.pagination.max) {
                    this.pagination.page = this.pagination.page + 1;

                    this.feeds = [];
                    this.fetchFeeds();
                }
            }
        },
        changeProvider(provider) {
            this.provider = provider;
            this.pagination.page = 1;

            this.feeds = [];
            this.fetchFeeds();
        },
        selectPost(i) {
            this.detailLoaded = false;

            this.selectedPost = {};
            this.fetchPost(i);
        },
    },
    created() {
        this.fetchFeeds();
    },
});
