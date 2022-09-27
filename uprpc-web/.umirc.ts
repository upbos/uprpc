export default {
    npmClient: 'yarn',
    plugins: ['@umijs/plugins/dist/antd'],
    antd: {},
    history: { type: 'hash' },
    publicPath: '/',
    outputPath: "../uprpc-app/frontend/dist",
    routes: [
        {path: '/', component: 'index'}
    ],
    theme: { '@primary-color': '#fa541c' }
};
