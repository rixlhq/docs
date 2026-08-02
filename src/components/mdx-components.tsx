import Link from "fumadocs-core/link";
import {Step, Steps} from "fumadocs-ui/components/steps";
import {Tab, Tabs} from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type {MDXComponents} from "mdx/types";
import {Callout, Card, Columns, Video} from "@/components";
import {Banner} from "@/components/mdx/banner";
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from "@/components/mdx/codeblock";
import {Heading} from "@/components/mdx/heading";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  const {Card: _, Cards, Callout: __, ...mdxComponents} = defaultMdxComponents;

  const rixlComponents = {
    Cards,
    Card,
    Callout,
    Columns,
    Video,
  };

  const customComponents = {
    Banner,
    Tab,
    Tabs,
    Step,
    Steps,
    Link,
    // Local overrides so translated strings render via paraglide.
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading as="h1" {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading as="h2" {...props} />,
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading as="h3" {...props} />,
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading as="h4" {...props} />,
    h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading as="h5" {...props} />,
    h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => <Heading as="h6" {...props} />,
  };

  return {
    ...mdxComponents,
    ...customComponents,
    ...rixlComponents,
    ...components,
  };
}
