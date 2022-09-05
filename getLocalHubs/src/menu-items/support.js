// assets
import { ChromeOutlined, QuestionOutlined, ContactsOutlined } from '@ant-design/icons';

// icons
const icons = {
    ChromeOutlined,
    QuestionOutlined,
    ContactsOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
    id: 'support',
    title: 'Support',
    type: 'group',
    children: [
        {
            id: 'sample-page',
            title: 'About Us',
            type: 'item',
            url: '/about-us',
            icon: icons.QuestionOutlined
        },
        {
            id:'contact-info',
            title:'Contact Us',
            type: 'item',
            url:'/contact',
            icon: icons.ContactsOutlined
        }
        // {
        //     id: 'documentation',
        //     title: 'Documentation',
        //     type: 'item',
        //     url: 'https://codedthemes.gitbook.io/mantis-react/',
        //     icon: icons.QuestionOutlined,
        //     external: true,
        //     target: true
        // }
    ]
};

export default support;
