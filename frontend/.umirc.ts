export default {
    npmClient: 'yarn',
    plugins: ['@umijs/plugins/dist/antd'],
    antd: {},
    history: { type: 'hash' },
    publicPath: '/',
    outputPath: "./dist",
    routes: [
        {path: '/', component: 'index'}
    ],
    theme: { '@primary-color': '#fa541c' }
};
