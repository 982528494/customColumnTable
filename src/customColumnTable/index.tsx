import React, {
  useState,
  ReactNode,
  useMemo,
  createContext,
  useContext,
  PropsWithChildren,
} from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  UniqueIdentifier,
  DropAnimation,
  Active,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { Popover, Button, Table, Checkbox, Row, Col, Tooltip } from "antd";
import type { TableProps } from "antd";
import "./index.less";

const Up = ({ onClick }: any) => (
  <Tooltip title="固定在列首">
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="vertical-align-top"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      color="#1890ff"
      onClick={onClick}
    >
      <path d="M859.9 168H164.1c-4.5 0-8.1 3.6-8.1 8v60c0 4.4 3.6 8 8.1 8h695.8c4.5 0 8.1-3.6 8.1-8v-60c0-4.4-3.6-8-8.1-8zM518.3 355a8 8 0 00-12.6 0l-112 141.7a7.98 7.98 0 006.3 12.9h73.9V848c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V509.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 355z"></path>
    </svg>
  </Tooltip>
);
const Down = ({ onClick }: any) => (
  <Tooltip title="固定在列尾">
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="vertical-align-top"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      color="#1890ff"
      onClick={onClick}
    >
      <path d="M859.9 780H164.1c-4.5 0-8.1 3.6-8.1 8v60c0 4.4 3.6 8 8.1 8h695.8c4.5 0 8.1-3.6 8.1-8v-60c0-4.4-3.6-8-8.1-8zM505.7 669a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V176c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8z"></path>
    </svg>
  </Tooltip>
);
const Cancel = ({ onClick }: any) => (
  <Tooltip title="不固定">
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="vertical-align-top"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      color="#1890ff"
      onClick={onClick}
    >
      <path d="M859.9 474H164.1c-4.5 0-8.1 3.6-8.1 8v60c0 4.4 3.6 8 8.1 8h695.8c4.5 0 8.1-3.6 8.1-8v-60c0-4.4-3.6-8-8.1-8zm-353.6-74.7c2.9 3.7 8.5 3.7 11.3 0l100.8-127.5c3.7-4.7.4-11.7-5.7-11.7H550V104c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v156h-62.8c-6 0-9.4 7-5.7 11.7l100.8 127.6zm11.4 225.4a7.14 7.14 0 00-11.3 0L405.6 752.3a7.23 7.23 0 005.7 11.7H474v156c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V764h62.8c6 0 9.4-7 5.7-11.7L517.7 624.7z"></path>
    </svg>
  </Tooltip>
);

interface BaseItem {
  id: UniqueIdentifier;
  title?: ReactNode;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange(items: T[], activeIndex: number, overIndex: number): void;
  renderItem(item: T): ReactNode;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export function SortableOverlay({ children }: any) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});
export function DragHandle() {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return (
    <button className="DragHandle" {...attributes} {...listeners} ref={ref}>
      <svg viewBox="0 0 20 20" width="12">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
      </svg>
    </button>
  );
}

export function SortableItem({ children, id }: PropsWithChildren<BaseItem>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  renderItem,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.id),
    [active, items]
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);
          onChange(items, activeIndex, overIndex);
        }
        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
        ))}
      </SortableContext>
      <SortableOverlay>
        {activeItem ? renderItem(activeItem) : null}
      </SortableOverlay>
    </DndContext>
  );
}

function compare(a: any, b: any) {
  const fixedOrder = { left: 0, undefined: 1, right: 2 };
  const aFixed: "left" | "right" | "undefined" = a.fixed || "undefined";
  const bFixed: "left" | "right" | "undefined" = b.fixed || "undefined";
  const fixedCompare = fixedOrder[aFixed] - fixedOrder[bFixed];
  if (fixedCompare !== 0) {
    return fixedCompare;
  }
  return a.order - b.order;
}

type fixedProps = "left" | "right" | undefined;
interface StorageProps {
  [key: string]: {
    show: boolean;
    fixed: fixedProps;
    order: number;
    [key: string]: any;
  };
}
interface CustomColumnTableProps {
  toolButton?: ReactNode[];
  columnsState: {
    value?: StorageProps; //列状态的值，支持受控模式
    onChange?: (val: StorageProps) => void; //列状态的值发生改变之后触发
    persistenceKey?: string; //持久化列的 key，用于判断是否是同一个 table
    persistenceType?: "localStorage" | "sessionStorage"; //持久化列的类类型， localStorage 设置在关闭浏览器后也是存在的，sessionStorage 关闭浏览器后会丢失
  };
  tableProps: Required<Pick<TableProps<any>, "columns">> &
    Omit<TableProps<any>, "columns">; //  columns必选,且key必填
}
export const CustomColumnTable = (props: CustomColumnTableProps) => {
  const { columnsState, tableProps, toolButton } = props;
  let { persistenceKey, persistenceType, onChange, value } = columnsState || {};
  let { columns } = tableProps;
  let initStorage: StorageProps = {};
  columns.forEach((item, index: number) => {
    initStorage[item.key!] = {
      show: true,
      fixed: item.fixed as fixedProps,
      order: index,
    };
  });
  let currentStorage = initStorage;
  if (persistenceKey && persistenceType) {
    if (persistenceType === "localStorage") {
      if (value) currentStorage = value;
      else
        currentStorage = localStorage.getItem(persistenceKey)
          ? JSON.parse(localStorage.getItem(persistenceKey)!)
          : initStorage;
    } else {
      if (value) currentStorage = value;
      else
        currentStorage = sessionStorage.getItem(persistenceKey)
          ? JSON.parse(sessionStorage.getItem(persistenceKey)!)
          : initStorage;
    }
  }
  const [storage, setStorage] = useState<StorageProps>(currentStorage);

  const mergeColumns = columns
    .map((item) => ({
      ...item,
      ...storage[item.key!],
      id: item.key!,
    }))
    .sort(compare);
  let initColumns = [...mergeColumns];
  const showColumns = initColumns.filter((item) => item.show !== false);
  const [checkList, setCheckList] = useState(
    showColumns.map((item) => item.id)
  );
  const leftColumns = initColumns.filter((item) => item.fixed === "left");
  const rightColumns = initColumns.filter((item) => item.fixed === "right");
  const undefinedColumns = initColumns.filter(
    (item) => item.fixed === undefined
  );

  const hanleColumnOnChange = (tempColumns: StorageProps) => {
    if (persistenceKey && persistenceType) {
      if (persistenceType === "localStorage") {
        localStorage.setItem(persistenceKey, JSON.stringify(tempColumns));
      } else {
        sessionStorage.setItem(persistenceKey, JSON.stringify(tempColumns));
      }
    }
    onChange && onChange(tempColumns);
  };
  const resetColumns = () => {
    setStorage(value ?? initStorage);
    hanleColumnOnChange(value ?? initStorage);
    setCheckList(initColumns.map((item) => item.id));
  };

  const checkAll = (isCheckAll: boolean) => {
    setCheckList(isCheckAll ? initColumns.map((item) => item.id) : []);
    const tempStorage = { ...storage };
    for (const key in tempStorage) {
      tempStorage[key].show = isCheckAll;
    }
    setStorage(tempStorage);
    hanleColumnOnChange(tempStorage);
  };
  //checkbox绑定事件，防止拖拽后checkbox onchange事件丢失
  const checkChange = (id: any) => {
    if (checkList.includes(id)) {
      setCheckList(checkList.filter((_item) => _item !== id));
      let tempStorage = { ...storage };
      tempStorage[id].show = false;
      setStorage(tempStorage);
      hanleColumnOnChange(tempStorage);
    } else {
      setCheckList([...checkList, id]);
      let tempStorage = { ...storage };
      tempStorage[id].show = true;
      setStorage(tempStorage);
      hanleColumnOnChange(tempStorage);
    }
  };
  // const checkCol = (targetItem: any, show: boolean, list: any) => {
  //   let tempStorge = { ...storage };
  //   tempStorge[targetItem].show = show;
  //   setStorage(tempStorge);
  //   hanleColumnOnChange(tempStorge);
  // };
  const fixed = (
    id: string | number,
    type: "left" | "right" | undefined = undefined
  ) => {
    let tempStorage = { ...storage };
    tempStorage[id].fixed = type;
    setStorage(tempStorage);
    hanleColumnOnChange(tempStorage);
  };
  const changeOrder = (items: any, activeIndex: number, overIndex: number) => {
    let tempColumns;
    items = arrayMove(items, activeIndex, overIndex);
    switch (items[0].fixed) {
      case "left":
        tempColumns = [...items, ...undefinedColumns, ...rightColumns];
        break;
      case "right":
        tempColumns = [...leftColumns, ...undefinedColumns, ...items];
        break;
      default:
        tempColumns = [...leftColumns, ...items, ...rightColumns];
        break;
    }
    let tempStorage: StorageProps = {};
    tempColumns.forEach((item, index: number) => {
      tempStorage[item.key] = {
        show: item.show,
        fixed: item.fixed as fixedProps,
        order: index,
      };
    });
    setStorage(tempStorage);
    hanleColumnOnChange(tempStorage);
  };
  const content = (
    <div>
      <Row justify="space-between" align="middle" className="top">
        <Col>
          <Checkbox
            checked={checkList.length === columns.length}
            indeterminate={
              checkList.length !== columns.length && checkList.length > 0
            }
            onClick={() => {
              const isCheckAll = checkList.length !== columns.length;
              checkAll(isCheckAll);
            }}
          >
            <span className="title"> 列展示</span>
          </Checkbox>
        </Col>
        <Col>
          <Button type="link" onClick={resetColumns}>
            重置
          </Button>
        </Col>
      </Row>
      <div className="inner-content">
        {/* <Checkbox.Group
          value={checkList}
          onChange={values => {
            if (values.length > checkList.length) {
              const showItem = values.find(
                (item: any) => !checkList.includes(item)
              );
              checkCol(showItem, true, values);
            }
            if (values.length < checkList.length) {
              const hideItem = checkList.find(item => !values.includes(item));
              checkCol(hideItem, false, values);
            }
          }}
        > */}
        {leftColumns.length > 0 && (
          <>
            <span className="list-title">固定在左侧</span>
            <div className="list-group">
              <SortableList<any>
                items={leftColumns}
                onChange={changeOrder}
                renderItem={(item) => (
                  <SortableItem id={item.id} key={item.id}>
                    <div className="item">
                      <DragHandle />
                      <Checkbox
                        className="checkbox"
                        value={item.id}
                        checked={checkList.includes(item.id)}
                        onChange={() => checkChange(item.id)}
                      >
                        {item.title}
                      </Checkbox>
                      <span className="fixbutton">
                        <Cancel onClick={() => fixed(item.id)} />
                        <Down onClick={() => fixed(item.id, "right")} />
                      </span>
                    </div>
                  </SortableItem>
                )}
              ></SortableList>
            </div>
          </>
        )}
        <span className="list-title">不固定</span>
        <div className="list-group">
          <SortableList<any>
            items={undefinedColumns}
            onChange={changeOrder}
            renderItem={(item) => (
              <SortableItem id={item.id} key={item.id}>
                <div className="item">
                  <DragHandle />
                  <Checkbox
                    className="checkbox"
                    value={item.id}
                    checked={checkList.includes(item.id)}
                    onChange={() => checkChange(item.id)}
                  >
                    {item.title}
                  </Checkbox>
                  <span className="fixbutton">
                    <Up onClick={() => fixed(item.id, "left")} />
                    <Down onClick={() => fixed(item.id, "right")} />
                  </span>
                </div>
              </SortableItem>
            )}
          ></SortableList>
        </div>

        {rightColumns.length > 0 && (
          <>
            <span className="list-title">固定在右侧</span>
            <div className="list-group">
              <SortableList<any>
                items={rightColumns}
                onChange={changeOrder}
                renderItem={(item) => (
                  <SortableItem id={item.id} key={item.id}>
                    <div className="item">
                      <DragHandle />
                      <Checkbox
                        className="checkbox"
                        value={item.id}
                        checked={checkList.includes(item.id)}
                        onChange={() => checkChange(item.id)}
                      >
                        {item.title}
                      </Checkbox>
                      <span className="fixbutton">
                        <Cancel onClick={() => fixed(item.id)} />
                        <Up onClick={() => fixed(item.id, "left")} />
                      </span>
                    </div>
                  </SortableItem>
                )}
              ></SortableList>
            </div>
          </>
        )}
        {/* </Checkbox.Group> */}
      </div>
    </div>
  );

  return (
    <>
      <Row justify="end" gutter={[16, 8]} style={{ marginBottom: 10 }}>
        {toolButton?.map((item, index) => (
          <Col key={index}>{item}</Col>
        ))}
        <Col>
          <Popover content={content} placement="left" trigger="click">
            <Button>自定义列</Button>
          </Popover>
        </Col>
      </Row>
      <Table {...tableProps} columns={showColumns} />
    </>
  );
};
