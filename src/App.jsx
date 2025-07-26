import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Card, Table, Tag, Spin, message, Statistic, Row, Col, Divider } from 'antd';
import { AreaChartOutlined, RiseOutlined, FallOutlined, StarOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const App = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analysisReport, setAnalysisReport] = useState([]);
  const [analysisDate, setAnalysisDate] = useState('');
  const [dataSource, setDataSource] = useState(''); // 数据源状态
  const [selectedFunds, setSelectedFunds] = useState([]); // 选中的基金

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/funds');
      setFunds(response.data);
      
      // 检查数据源类型
      const hasRealTimeData = response.data.some(fund => 
        fund.netWorth && fund.netWorth !== '0.0000' && 
        fund.updateTime && new Date(fund.updateTime).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );
      
      if (hasRealTimeData) {
        setDataSource('Yahoo Finance 实时数据');
        message.success(`基金数据获取成功，共获取 ${response.data.length} 只基金 (Yahoo Finance 实时数据)`);
      } else {
        setDataSource('模拟数据');
        message.success(`基金数据获取成功，共获取 ${response.data.length} 只基金 (模拟数据)`);
      }
    } catch (error) {
      console.error('获取基金数据失败:', error);
      if (error.response) {
        // 服务器返回了错误响应
        message.error(`获取基金数据失败: ${error.response.data.message || '服务器错误'}`);
      } else if (error.request) {
        // 请求发送了但没有收到响应
        message.error('获取基金数据失败: 无法连接到服务器，请检查网络连接');
      } else {
        // 其他错误
        message.error('获取基金数据失败: 请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeFunds = async () => {
    if (funds.length === 0) {
      message.warning('请先获取基金数据');
      return;
    }

    if (selectedFunds.length === 0) {
      message.warning('请至少选择一个基金进行分析');
      return;
    }

    if (selectedFunds.length < 2) {
      message.warning('请至少选择两个基金以上进行AI智能分析');
      return;
    }

    // 获取选中的基金数据
    const selectedFundsData = funds.filter(fund => selectedFunds.includes(fund.code));

    console.log('🚀 开始分析基金，选中基金数量:', selectedFundsData.length);
    console.log('📊 发送分析请求到服务器...');
    
    setAnalyzing(true);
    try {
      const response = await axios.post('/api/analyze', { funds: selectedFundsData });
      console.log('✅ 收到服务器响应:', response.data);
      
      setRecommendations(response.data.recommendations);
      setAnalysisReport(response.data.analysisReport || []);
      setAnalysisDate(response.data.analysisDate || '');
      message.success(`基金分析完成，推荐 ${response.data.recommendations.length} 只基金`);
    } catch (error) {
      console.error('❌ 分析基金失败:', error);
      if (error.response) {
        console.error('服务器响应错误:', error.response.data);
        message.error(`分析基金失败: ${error.response.data.message || '服务器错误'}`);
      } else if (error.request) {
        console.error('网络请求错误:', error.request);
        message.error('分析基金失败: 无法连接到服务器，请检查网络连接');
      } else {
        console.error('其他错误:', error.message);
        message.error('分析基金失败: 请稍后重试');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // 处理基金选择
  const handleFundSelection = (selectedRowKeys) => {
    setSelectedFunds(selectedRowKeys);
  };

  // 清空选择
  const clearSelection = () => {
    setSelectedFunds([]);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFunds.length === funds.length) {
      setSelectedFunds([]);
    } else {
      setSelectedFunds(funds.map(fund => fund.code));
    }
  };

  const columns = [
    {
      title: '基金名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1890ff' }}>
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            代码: {record.code}
          </div>
          {recommendations.includes(record.code) && (
            <Tag color="green" size="small" style={{ marginTop: 4 }}>
              推荐
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '单位净值',
      dataIndex: 'netWorth',
      key: 'netWorth',
      render: (value) => value || '-',
    },
    {
      title: '日增长率',
      dataIndex: 'dayGrowth',
      key: 'dayGrowth',
      sorter: (a, b) => parseFloat(a.dayGrowth) - parseFloat(b.dayGrowth),
      render: (value) => {
        if (!value) return '-';
        const numValue = parseFloat(value);
        const isPositive = numValue >= 0;
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
            {isPositive ? '+' : ''}{numValue.toFixed(2)}%
            {isPositive ? <RiseOutlined /> : <FallOutlined />}
          </span>
        );
      },
    },
    {
      title: '基金类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = 'blue';
        if (type === '股票型') color = 'red';
        if (type === '混合型') color = 'orange';
        if (type === '债券型') color = 'green';
        if (type === '指数型') color = 'purple';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: '近1年收益',
      dataIndex: 'yearReturn',
      key: 'yearReturn',
      sorter: (a, b) => a.yearReturn - b.yearReturn,
      render: (value) => {
        const isPositive = value >= 0;
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
            {isPositive ? <RiseOutlined /> : <FallOutlined />}
          </span>
        );
      },
    },
    {
      title: '近3年收益',
      dataIndex: 'threeYearReturn',
      key: 'threeYearReturn',
      sorter: (a, b) => a.threeYearReturn - b.threeYearReturn,
      render: (value) => {
        const isPositive = value >= 0;
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
            {isPositive ? <RiseOutlined /> : <FallOutlined />}
          </span>
        );
      },
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      filters: [
        { text: '低风险', value: '低风险' },
        { text: '中低风险', value: '中低风险' },
        { text: '中风险', value: '中风险' },
        { text: '中高风险', value: '中高风险' },
        { text: '高风险', value: '高风险' },
      ],
      onFilter: (value, record) => record.riskLevel === value,
      render: (level) => {
        let color = 'green';
        if (level === '中低风险') color = 'cyan';
        if (level === '中风险') color = 'blue';
        if (level === '中高风险') color = 'orange';
        if (level === '高风险') color = 'red';
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: '基金经理',
      dataIndex: 'manager',
      key: 'manager',
      width: 150,
      render: (manager) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            marginRight: '8px'
          }}>
            {manager ? manager.charAt(0) : '?'}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {manager || '未知'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              基金经理
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (value) => value ? new Date(value).toLocaleString() : '-',
    },
  ];

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Title level={3} style={{ color: 'white', margin: '16px 0' }}>
          基金分析系统
        </Title>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card>
                <Title level={4}>基金分析与推荐</Title>
                <Paragraph>
                  本系统获取实时股票数据，并结合DeepSeek大语言模型进行智能分析，根据历史表现、风险特征、基金经理能力等多维度指标，为您推荐最适合投资的基金产品。
                </Paragraph>
                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    onClick={fetchFunds} 
                    loading={loading}
                    style={{ marginRight: 16 }}
                  >
                    获取基金数据
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={analyzeFunds} 
                    loading={analyzing}
                    disabled={funds.length === 0 || selectedFunds.length < 2}
                    icon={<AreaChartOutlined />}
                    style={{ marginRight: 16 }}
                  >
                    AI智能分析 {selectedFunds.length > 0 && `(${selectedFunds.length}个基金)`}
                  </Button>
                  {funds.length > 0 && (
                    <>
                      <Button 
                        onClick={toggleSelectAll}
                        style={{ marginRight: 8 }}
                      >
                        {selectedFunds.length === funds.length ? '取消全选' : '全选'}
                      </Button>
                      <Button 
                        onClick={clearSelection}
                        disabled={selectedFunds.length === 0}
                      >
                        清空选择
                      </Button>
                    </>
                  )}
                </div>
                {selectedFunds.length > 0 && (
                  <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                      已选择 {selectedFunds.length} 个基金
                    </span>
                    {selectedFunds.length < 2 && (
                      <span style={{ color: '#faad14', marginLeft: 8 }}>
                        (至少需要选择2个基金进行AI分析)
                      </span>
                    )}
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {recommendations.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card 
                  title={
                    <div>
                      <span>推荐基金</span>
                      {analysisDate && (
                        <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '10px' }}>
                          分析时间: {new Date(analysisDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  } 
                  className="recommended"
                >
                  <Row gutter={16}>
                    {analysisReport.length > 0 ? (
                      analysisReport.map((report, index) => {
                        const fund = funds.find(f => f.code === report.code) || {};
                        return (
                          <Col xs={24} sm={24} md={8} key={report.code}>
                            <Card 
                              className="fund-card" 
                              title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{report.name}</span>
                                  <Tag color="green">推荐 {index + 1}</Tag>
                                </div>
                              }
                            >
                              <Paragraph>基金代码: <span style={{ fontWeight: 'bold', color: '#666' }}>{report.code}</span></Paragraph>
                              <Paragraph>基金类型: <Tag color="blue">{fund.type || '未知'}</Tag></Paragraph>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ marginRight: '8px' }}>基金经理:</span>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#52c41a',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginRight: '6px'
                                  }}>
                                    {fund.manager ? fund.manager.charAt(0) : '?'}
                                  </div>
                                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                    {fund.manager || '未知'}
                                  </span>
                                </div>
                              </div>
                              <Paragraph>综合评分: <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{report.score}</span></Paragraph>
                              <Paragraph>
                                单位净值: <span style={{ fontWeight: 'bold' }}>{fund.netWorth || '-'}</span>
                                <span style={{ marginLeft: '15px' }}>日增长率: </span>
                                {fund.dayGrowth && (
                                  <span style={{ fontWeight: 'bold', color: parseFloat(fund.dayGrowth) >= 0 ? '#52c41a' : '#f5222d' }}>
                                    {parseFloat(fund.dayGrowth) >= 0 ? '+' : ''}{parseFloat(fund.dayGrowth).toFixed(2)}%
                                  </span>
                                )}
                              </Paragraph>
                              
                              <Divider>业绩表现</Divider>
                              
                              <div className="fund-stats">
                                <div className="fund-stat-item">
                                  <div className="fund-stat-value" style={{ color: fund.yearReturn >= 0 ? '#52c41a' : '#f5222d' }}>
                                    {report.yearReturn}
                                  </div>
                                  <div className="fund-stat-label">近1年</div>
                                </div>
                                <div className="fund-stat-item">
                                  <div className="fund-stat-value" style={{ color: fund.threeYearReturn >= 0 ? '#52c41a' : '#f5222d' }}>
                                    {report.threeYearReturn}
                                  </div>
                                  <div className="fund-stat-label">近3年</div>
                                </div>
                                <div className="fund-stat-item">
                                  <div className="fund-stat-value" style={{ color: report.excessYearReturn.startsWith('+') ? '#52c41a' : '#f5222d' }}>
                                    {report.excessYearReturn}
                                  </div>
                                  <div className="fund-stat-label">同类超额</div>
                                </div>
                              </div>
                              
                              <Divider>推荐理由</Divider>
                              {report.reasons && report.reasons.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                  {report.reasons.map((reason, idx) => (
                                    <div key={idx} style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      marginBottom: '8px',
                                      padding: '8px',
                                      backgroundColor: '#f6ffed',
                                      borderRadius: '4px',
                                      border: '1px solid #b7eb8f'
                                    }}>
                                      <span style={{ 
                                        color: '#52c41a', 
                                        fontWeight: 'bold', 
                                        marginRight: '8px',
                                        fontSize: '16px'
                                      }}>
                                        ✓
                                      </span>
                                      <span style={{ color: '#389e0d' }}>{reason}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <Divider>分析报告</Divider>
                              <div className="analysis-result">
                                <Paragraph>{report.analysis}</Paragraph>
                              </div>
                            </Card>
                          </Col>
                        );
                      })
                    ) : (
                      funds
                        .filter(fund => recommendations.includes(fund.code))
                        .map(fund => (
                          <Col xs={24} sm={12} md={8} key={fund.code}>
                            <Card className="fund-card" title={fund.name} extra={<Tag color="green">推荐</Tag>}>
                              <Paragraph>基金代码: <span style={{ fontWeight: 'bold', color: '#666' }}>{fund.code}</span></Paragraph>
                              <Paragraph>基金类型: <Tag color="blue">{fund.type}</Tag></Paragraph>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ marginRight: '8px' }}>基金经理:</span>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#52c41a',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginRight: '6px'
                                  }}>
                                    {fund.manager ? fund.manager.charAt(0) : '?'}
                                  </div>
                                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                    {fund.manager}
                                  </span>
                                </div>
                              </div>
                              <Paragraph>
                                单位净值: <span style={{ fontWeight: 'bold' }}>{fund.netWorth || '-'}</span>
                                <span style={{ marginLeft: '15px' }}>日增长率: </span>
                                {fund.dayGrowth && (
                                  <span style={{ fontWeight: 'bold', color: parseFloat(fund.dayGrowth) >= 0 ? '#52c41a' : '#f5222d' }}>
                                    {parseFloat(fund.dayGrowth) >= 0 ? '+' : ''}{parseFloat(fund.dayGrowth).toFixed(2)}%
                                  </span>
                                )}
                              </Paragraph>
                              
                              <Divider>业绩表现</Divider>
                              
                              <div className="fund-stats">
                                <div className="fund-stat-item">
                                  <div className="fund-stat-value" style={{ color: fund.yearReturn >= 0 ? '#52c41a' : '#f5222d' }}>
                                    {fund.yearReturn >= 0 ? '+' : ''}{fund.yearReturn.toFixed(2)}%
                                  </div>
                                  <div className="fund-stat-label">近1年</div>
                                </div>
                                <div className="fund-stat-item">
                                  <div className="fund-stat-value" style={{ color: fund.threeYearReturn >= 0 ? '#52c41a' : '#f5222d' }}>
                                    {fund.threeYearReturn >= 0 ? '+' : ''}{fund.threeYearReturn.toFixed(2)}%
                                  </div>
                                  <div className="fund-stat-label">近3年</div>
                                </div>
                                <div className="fund-stat-item">
                                  <div className="fund-stat-value">
                                    {fund.riskLevel}
                                  </div>
                                  <div className="fund-stat-label">风险等级</div>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        ))
                    )}
                  </Row>
                </Card>
              </Col>
            </Row>
          )}

          <Row>
            <Col span={24}>
              <Card 
                title="基金列表" 
                extra={
                  <div>
                    <span>{funds.length} 只基金</span>
                    {dataSource && (
                      <Tag 
                        color={dataSource.includes('Yahoo Finance') ? 'blue' : dataSource === '实时数据' ? 'green' : 'orange'} 
                        style={{ marginLeft: 8 }}
                      >
                        {dataSource}
                      </Tag>
                    )}
                  </div>
                }
              >
                <Table 
                  dataSource={funds} 
                  columns={columns} 
                  rowKey="code"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  rowSelection={{
                    selectedRowKeys: selectedFunds,
                    onChange: handleFundSelection,
                    type: 'checkbox',
                    getCheckboxProps: (record) => ({
                      name: record.name,
                    }),
                  }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        基金分析系统 ©{new Date().getFullYear()} 使用 DeepSeek 模型提供智能分析
      </Footer>
    </Layout>
  );
};

export default App;