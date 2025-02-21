// This whole file is copied from the official example in 
// https://ant.design/components/tabs/#components-tabs-demo-custom-tab-bar-node

import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import React, { useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const type = 'DraggableTabNode';
interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  index: React.Key;
  moveNode: (dragIndex: React.Key, hoverIndex: React.Key) => void;
}

const DraggableTabNode = ({ index, children, moveNode }: DraggableTabPaneProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: 'dropping',
      };
    },
    drop: (item: { index: React.Key }) => {
      moveNode(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <div ref={ref} className={isOver ? dropClassName : ''}>
      {children}
    </div>
  );
};

const DraggableTab: React.FunctionComponent<{
    children: React.ReactNode,
    setTabOrder: (s: React.Key[]) => void,
    onTabEdit: (target: any, action: "add" | "remove") => void,
    config: TabsProps
  }> = props => {
  const { children } = props;
  const [order, setOrder] = useState<React.Key[]>([]);

  const moveTabNode = (dragKey: React.Key, hoverKey: React.Key) => {
    const newOrder = order.slice();

    //@ts-ignore // This is the example from AntDesign official page, not sure
    // Why here's a Typecheck issue.
    React.Children.forEach(children, (c: React.ReactElement) => {
      if (c.key && newOrder.indexOf(c.key) === -1) {
        newOrder.push(c.key);
      }
    });

    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);

    setOrder(newOrder);
    props.setTabOrder(newOrder);
  };

  const removeTabNode = (target_key: any, action: "add" | "remove") => {
    switch (action) {
      case "add":
        break;
      case "remove":
        let new_order: React.Key[] = [...order];
        new_order = new_order.filter((tab) => tab + "" !== target_key + "");
        setOrder(new_order);
        break;
    }
    props.onTabEdit(target_key, action);
  }

  const renderTabBar: TabsProps['renderTabBar'] = (tabBarProps, DefaultTabBar) => (
    <DefaultTabBar {...tabBarProps}>
      {node => (
        <DraggableTabNode key={node.key} index={node.key!} moveNode={moveTabNode}>
          {node}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  const tabs: React.ReactElement[] = [];
  //@ts-ignore // This is the example from AntDesign official page, not sure
  // Why here's a Typecheck issue.
  React.Children.forEach(children, (c: React.ReactElement) => {
    tabs.push(c);
  });

  const orderTabs = tabs.slice().sort((a, b) => {
    const orderA = order.indexOf(a.key!);
    const orderB = order.indexOf(b.key!);

    if (orderA !== -1 && orderB !== -1) {
      return orderA - orderB;
    }
    if (orderA !== -1) {
      return -1;
    }
    if (orderB !== -1) {
      return 1;
    }

    const ia = tabs.indexOf(a);
    const ib = tabs.indexOf(b);

    return ia - ib;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs renderTabBar={renderTabBar} onEdit={removeTabNode} {...props.config}>
        {orderTabs}
      </Tabs>
    </DndProvider>
  );
};


export default DraggableTab;
