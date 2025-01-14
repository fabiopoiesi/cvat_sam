// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedState } from 'reducers';
import Text from 'antd/lib/typography/Text';
import Modal from 'antd/lib/modal';
import InputNumber from 'antd/lib/input-number';
import { analyticsActions, updateQualitySettingsAsync } from 'actions/analytics-actions';
import { Col, Row } from 'antd/lib/grid';
import { Divider } from 'antd';
import Form from 'antd/lib/form';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import CVATTooltip from 'components/common/cvat-tooltip';
import { QuestionCircleOutlined } from '@ant-design/icons/lib/icons';

export default function QualitySettingsModal(): JSX.Element | null {
    const visible = useSelector((state: CombinedState) => state.analytics.quality.settings.modalVisible);
    const loading = useSelector((state: CombinedState) => state.analytics.quality.settings.fetching);
    const settings = useSelector((state: CombinedState) => state.analytics.quality.settings.current);
    const [form] = Form.useForm();

    const dispatch = useDispatch();

    const onOk = useCallback(async () => {
        try {
            if (settings) {
                const values = await form.validateFields();
                settings.lowOverlapThreshold = values.lowOverlapThreshold / 100;
                settings.iouThreshold = values.iouThreshold / 100;
                settings.compareAttributes = values.compareAttributes;

                settings.oksSigma = values.oksSigma / 100;

                settings.lineThickness = values.lineThickness / 100;
                settings.lineOrientationThreshold = values.lineOrientationThreshold / 100;
                settings.orientedLines = values.orientedLines;

                settings.compareGroups = values.compareGroups;
                settings.groupMatchThreshold = values.groupMatchThreshold / 100;

                settings.checkCoveredAnnotations = values.checkCoveredAnnotations;
                settings.objectVisibilityThreshold = values.objectVisibilityThreshold / 100;

                settings.panopticComparison = values.panopticComparison;

                await dispatch(updateQualitySettingsAsync(settings));
                await dispatch(analyticsActions.switchQualitySettingsVisible(false));
            }
            return settings;
        } catch (e) {
            return false;
        }
    }, [settings]);

    const onCancel = useCallback(() => {
        dispatch(analyticsActions.switchQualitySettingsVisible(false));
    }, []);

    const generalTooltip = (
        <div className='cvat-analytics-settings-tooltip-inner'>
            <Text>
                Min overlap threshold(IoU) is used for distinction between matched / unmatched shapes.
            </Text>
            <Text>
                Low overlap threshold is used for distinction between strong / weak (low overlap) matches.
            </Text>
        </div>
    );

    const keypointTooltip = (
        <div className='cvat-analytics-settings-tooltip-inner'>
            <Text>
                OKS Sigma Like IoU threshold, but for points.
                The percent of the bbox area, used as the radius of the circle around the GT point,
                where the checked point is expected to be.
            </Text>
        </div>
    );

    const linesTooltip = (
        <div className='cvat-analytics-settings-tooltip-inner'>
            <Text>
                Line thickness - thickness of polylines, relatively to the (image area) ^ 0.5.
                The distance to the boundary around the GT line,
                inside of which the checked line points should be.
            </Text>
            <Text>
                Check orientation - Indicates that polylines have direction.
            </Text>
            <Text>
                Min similarity gain - The minimal gain in the GT IoU between the given and reversed line directions
                to consider the line inverted. Only useful with the Check orientation parameter.
            </Text>
        </div>
    );

    const groupTooltip = (
        <div className='cvat-analytics-settings-tooltip-inner'>
            <Text>
                Compare groups - Enables or disables annotation group checks.
            </Text>
            <Text>
                Min group match threshold - Minimal IoU for groups to be considered matching,
                used when the Compare groups is enabled.
            </Text>
        </div>
    );

    const segmentationTooltip = (
        <div className='cvat-analytics-settings-tooltip-inner'>
            <Text>
                Check object visibility - Check for partially-covered annotations.
            </Text>
            <Text>
                Min visibility threshold - Minimal visible area percent of the spatial annotations (polygons, masks)
                for reporting covered annotations, useful with the Check object visibility option.
            </Text>
            <Text>
                Match only visible parts - Use only the visible part of the masks and polygons in comparisons.
            </Text>
        </div>
    );

    return (
        <Modal
            okType='primary'
            okText='Save'
            cancelText='Cancel'
            title={<Text strong>Annotation Quality Settings</Text>}
            visible={visible}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={loading}
            className='cvat-modal-quality-settings'
        >
            { settings ? (
                <Form
                    form={form}
                    layout='vertical'
                    initialValues={{
                        lowOverlapThreshold: settings.lowOverlapThreshold * 100,
                        iouThreshold: settings.iouThreshold * 100,
                        compareAttributes: settings.compareAttributes,

                        oksSigma: settings.oksSigma * 100,

                        lineThickness: settings.lineThickness * 100,
                        lineOrientationThreshold: settings.lineOrientationThreshold * 100,
                        orientedLines: settings.orientedLines,

                        compareGroups: settings.compareGroups,
                        groupMatchThreshold: settings.groupMatchThreshold * 100,

                        checkCoveredAnnotations: settings.checkCoveredAnnotations,
                        objectVisibilityThreshold: settings.objectVisibilityThreshold * 100,
                        panopticComparison: settings.panopticComparison,
                    }}
                >
                    <Row className='cvat-quality-settings-title'>
                        <Text strong>
                            General
                        </Text>
                        <CVATTooltip title={generalTooltip} className='cvat-analytics-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                            <QuestionCircleOutlined
                                style={{ opacity: 0.5 }}
                            />
                        </CVATTooltip>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='iouThreshold'
                                label='Min overlap threshold (%)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='lowOverlapThreshold'
                                label='Low overlap threshold (%)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='compareAttributes'
                                valuePropName='checked'
                                rules={[{ required: true }]}
                            >
                                <Checkbox>
                                    <Text className='cvat-text-color'>Compare attributes</Text>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Row className='cvat-quality-settings-title'>
                        <Text strong>
                            Keypoint Comparison
                        </Text>
                        <CVATTooltip title={keypointTooltip} className='cvat-analytics-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                            <QuestionCircleOutlined
                                style={{ opacity: 0.5 }}
                            />
                        </CVATTooltip>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='oksSigma'
                                label='OKS sigma'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Row className='cvat-quality-settings-title'>
                        <Text strong>
                            Line Comparison
                        </Text>
                        <CVATTooltip title={linesTooltip} className='cvat-analytics-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                            <QuestionCircleOutlined
                                style={{ opacity: 0.5 }}
                            />
                        </CVATTooltip>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='lineThickness'
                                label='Relative thickness (frame side %)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={1000} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='orientedLines'
                                rules={[{ required: true }]}
                                valuePropName='checked'
                            >
                                <Checkbox>
                                    <Text className='cvat-text-color'>Check orientation</Text>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='lineOrientationThreshold'
                                label='Min similarity gain (%)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Row className='cvat-quality-settings-title'>
                        <Text strong>
                            Group Comparison
                        </Text>
                        <CVATTooltip title={groupTooltip} className='cvat-analytics-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                            <QuestionCircleOutlined
                                style={{ opacity: 0.5 }}
                            />
                        </CVATTooltip>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='compareGroups'
                                valuePropName='checked'
                                rules={[{ required: true }]}
                            >
                                <Checkbox>
                                    <Text className='cvat-text-color'>Compare groups</Text>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='groupMatchThreshold'
                                label='Min group match threshold (%)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Row className='cvat-quality-settings-title'>
                        <Text strong>
                            Segmentation Comparison
                        </Text>
                        <CVATTooltip title={segmentationTooltip} className='cvat-analytics-tooltip' overlayStyle={{ maxWidth: '500px' }}>
                            <QuestionCircleOutlined
                                style={{ opacity: 0.5 }}
                            />
                        </CVATTooltip>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='checkCoveredAnnotations'
                                valuePropName='checked'
                                rules={[{ required: true }]}
                            >
                                <Checkbox>
                                    <Text className='cvat-text-color'>Check object visibility</Text>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='objectVisibilityThreshold'
                                label='Min visibility threshold (area %)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                name='panopticComparison'
                                valuePropName='checked'
                                rules={[{ required: true }]}
                            >
                                <Checkbox>
                                    <Text className='cvat-text-color'>Match only visible parts</Text>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            ) : (
                <Text>No quality settings</Text>
            )}
        </Modal>
    );
}
