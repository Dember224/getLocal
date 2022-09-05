// assets
import {
    AppstoreAddOutlined,
    AntDesignOutlined,
    BarcodeOutlined,
    BgColorsOutlined,
    FontSizeOutlined,
    LoadingOutlined,
    DatabaseOutlined
} from '@ant-design/icons';

// icons
const icons = {
    FontSizeOutlined,
    BgColorsOutlined,
    BarcodeOutlined,
    AntDesignOutlined,
    LoadingOutlined,
    AppstoreAddOutlined,
    DatabaseOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
    id: 'utilities',
    title: 'Raw Data',
    type: 'group',
    children: [
        // {
        //     id: 'util-typography',
        //     title: 'Typography',
        //     type: 'item',
        //     url: '/typography',
        //     icon: icons.FontSizeOutlined
        // },
        // {
        //     id: 'util-color',
        //     title: 'Color',
        //     type: 'item',
        //     url: '/color',
        //     icon: icons.BgColorsOutlined
        // },
        {
            id: 'util-shadow',
            title: 'Race List',
            type: 'item',
            url: '/shadow',
            icon: icons.DatabaseOutlined
        },
        // {
        //     id: 'ant-icons',
        //     title: 'Ant Icons',
        //     type: 'item',
        //     url: '/icons/ant',
        //     icon: icons.AntDesignOutlined,
        //     breadcrumbs: false
        // }
    ]
};

export default utilities;
