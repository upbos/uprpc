export default {
    npmClient: 'yarn',
    plugins: ['@umijs/plugins/dist/antd'],
    antd: {},
    history: { type: 'hash' },
    publicPath: '/',
    routes: [
        {path: '/', component: 'index'}
    ],
    theme: { '@primary-color': '#fa541c' }
};
