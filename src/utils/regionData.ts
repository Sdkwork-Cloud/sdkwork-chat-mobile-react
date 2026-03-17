export interface RegionNode {
  code: string;
  name: string;
  children?: RegionNode[];
}

export const REGION_DATA: RegionNode[] = [
  {
    code: 'CN',
    name: 'China',
    children: [
      {
        code: '310000',
        name: 'Shanghai',
        children: [
          {
            code: '310100',
            name: 'Shanghai City',
            children: [
              { code: '310101', name: 'Huangpu District' },
              { code: '310104', name: 'Xuhui District' },
              { code: '310105', name: 'Changning District' },
              { code: '310115', name: 'Pudong New Area' },
              { code: '310110', name: 'Yangpu District' },
            ],
          },
        ],
      },
      {
        code: '110000',
        name: 'Beijing',
        children: [
          {
            code: '110100',
            name: 'Beijing City',
            children: [
              { code: '110101', name: 'Dongcheng District' },
              { code: '110105', name: 'Chaoyang District' },
              { code: '110108', name: 'Haidian District' },
            ],
          },
        ],
      },
      {
        code: '330000',
        name: 'Zhejiang',
        children: [
          {
            code: '330100',
            name: 'Hangzhou',
            children: [
              { code: '330106', name: 'Xihu District' },
              { code: '330108', name: 'Binjiang District' },
              { code: '330110', name: 'Yuhang District' },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    children: [
      {
        code: 'CA',
        name: 'California',
        children: [
          { code: 'LA', name: 'Los Angeles' },
          { code: 'SF', name: 'San Francisco' },
          { code: 'SD', name: 'San Diego' },
        ],
      },
      {
        code: 'NY',
        name: 'New York',
        children: [
          { code: 'NYC', name: 'New York City' },
          { code: 'BUF', name: 'Buffalo' },
        ],
      },
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    children: [
      {
        code: '13',
        name: 'Tokyo',
        children: [
          { code: '13101', name: 'Chiyoda' },
          { code: '13103', name: 'Minato' },
          { code: '13104', name: 'Shinjuku' },
        ],
      },
    ],
  },
];
