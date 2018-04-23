import * as React from 'react';
import { connect } from 'react-redux';

// TS < 2.8
// type Diff<T extends string, U extends string> = ({ [P in T]: P } &
//   { [P in U]: never } & { [x: string]: never })[T];
// type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// SHARED INTERFACES
// isBla is always injected
interface IInjectedProps {
  isBla: boolean;
}

// HOC WITH ADDED PROPS
export function withAddingProps<T extends IInjectedProps>(
  WrappedComponent: React.ComponentType<T>
) {
  type Props = Omit<T, keyof IInjectedProps>;
  return class Container extends React.Component<Props> {
    public render() {
      return <WrappedComponent {...this.props} isBla={true} />;
    }
  };
}

// Component
interface IComponentProps {
  isBla: boolean; // the injected prop
  hi: string;
  boo: string;
}

const Comp = (props: IComponentProps) => <p />;

// Using Hoc & Component
const CompWithProp = withAddingProps(Comp);

// connecting
const connectCompWithProp = connect(() => ({ boo: 'boe', hi: 'oi' }))(CompWithProp);

// component
const UsingCompWithBla = () => <CompWithProp boo="boe" hi="hoi" />;

// HOC WITH JUST ADJUSTING PROPS
interface IAdjustedProps {
  boo: string;
}

export function withAdjustingProps<T extends IAdjustedProps>(
  WrappedComponent: React.StatelessComponent<T>
) {
  return class Container extends React.Component<T> {
    public render() {
      return <WrappedComponent {...this.props} boo={`addedtext-${this.props.boo}`} />;
    }
  };
}

// Using Hoc & Component
const CompWithAdjusted = withAdjustingProps<IComponentProps>(Comp);

// connecting
const ConnectCompWithAdjusted = connect(() => ({ boo: 'boe' }))(CompWithAdjusted);

// component
const UsingCompWithAdjusted = () => <CompWithAdjusted hi="hi" boo="boe" isBla={true} />;
const UsingConnectedCompWithAdjusted = () => <ConnectCompWithAdjusted hi="hello" isBla={true} />;

// HOC WITH USING EXTERNAL PROPS (which are not needed in wrapped component) (not 100%)
interface IOwnProps {
  boo: boolean;
}

export function withExternalProp<T extends IInjectedProps>(
  WrappedComponent: React.ComponentType<T>
) {
  type Props = Omit<T, keyof IInjectedProps> & IOwnProps;

  return class Container extends React.Component<Props> {
    public render() {
      // If only this worked...
      // const { boe, ...rest } = this.props;
      const bla = this.props.boo ? true : false;

      // Boe WILL get passed, but typing should help to prevent from being able to use
      // return <WrappedComponent {...rest} isBla={bla} />;
      return <WrappedComponent {...this.props} isBla={bla} />;
    }
  };
}

// Component
// adding `boe: boolean;` is still possible and will work..
interface IComponentWithoutExternalProp {
  isBla: boolean;
  hi: string;
}

const CompWithoutExternalProp = (props: IComponentWithoutExternalProp) => <p />;

// Using Hoc & Component
const CompWithExternalProp = withExternalProp(CompWithoutExternalProp);

// connecting
const ConnectedCompWithExternalProp = connect(() => ({ boo: true }))(CompWithExternalProp);

// in component
const UsingCompWithExternalProp = () => <CompWithExternalProp boo={true} hi="oi" />;
const UsingConnectedCompWithExternalProp = () => <ConnectedCompWithExternalProp hi="oi" />;

// HOC WITH ADDING PROPS FROM REDUX-CONNECT
interface IReduxStateProps {
  yo: boolean;
}

export function withConnect<T extends IInjectedProps & IReduxStateProps>(
  WrappedComponent: React.ComponentType<T>
) {
  type Props = Omit<T, keyof IInjectedProps> & IReduxStateProps;

  class Container extends React.Component<Props> {
    public render() {
      const bla = this.props.yo ? true : false;

      return <WrappedComponent {...this.props} isBla={bla} />;
    }
  }

  return connect(() => ({ yo: true }))(Container);
}

// Component
interface IComponentWithConnectedProps {
  isBla: boolean;
  hi: string;
  yo: boolean;
  cat: string;
}

const CompWithoutConnect = (props: IComponentWithConnectedProps) => <p />;

// Using Hoc & Component
const CompWithConnect = withConnect(CompWithoutConnect);

// connecting
const ConnectConnectedHocComponent = connect(() => ({
  hi: 'oi'
}))(CompWithConnect);

// component
const UsingConnectedHocComponent = () => <CompWithConnect hi="oi" cat="meow" />;
const UsingConnecrConnectedHocComponent = () => <ConnectConnectedHocComponent cat="meow" />;

// HOC CONNECTING TO COMPONENT WITH OPTIONAL PROPS
// Component
interface IComponentWithOptionalProps {
  isBla: boolean;
  hi: string;
  cat?: string;
}

const CompWithOptional = (props: IComponentWithOptionalProps) => <p />;

// Using Hoc & Component
const CompConnectWithOptional = withAddingProps(CompWithOptional);

// connecting
// Interface is needed in case the connected component has optional properties
interface IConnectStateProps {
  hi: string;
  cat?: string; // this is needed otherwise `connect` infers cat as mandatory prop and it fails to typecheck against the component
}

const ConnectCompWithOptionalConnect = connect<IConnectStateProps>(() => ({
  hi: 'oi',
  cat: 'meow'
}))(CompConnectWithOptional);

// component
const UsingCompWithOptionalConnect = () => <CompConnectWithOptional hi="oi" cat="meow" />;
const UsingConnectCompWithOptionalConnect = () => <ConnectCompWithOptionalConnect />;
