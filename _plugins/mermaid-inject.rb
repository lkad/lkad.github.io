#!/usr/bin/env ruby
# frozen_string_literal: true
#
# Mermaid.js auto-injection hook.
# After Jekyll renders a page or post, append the local mermaid assets
# right before </head> so fenced ```mermaid blocks can render at runtime.

module Jekyll
  module MermaidInjector
    def self.script_tags(site)
      base = site.config["baseurl"] || ""
      <<~HTML
        <script src="#{base}/assets/js/mermaid/mermaid.min.js" defer></script>
        <script src="#{base}/assets/js/mermaid/init.js" defer></script>
      HTML
    end

    def self.apply(_site, doc)
      return unless doc.respond_to?(:output=) && doc.output
      out = doc.output
      return out if out.include?("mermaid.min.js")
      head_close = out.index("</head>")
      return out unless head_close
      doc.output = out.dup.insert(head_close, script_tags(doc.site))
    end
  end

  Hooks.register :pages, :post_render do |page|
    MermaidInjector.apply(page.site, page)
  end

  Hooks.register :posts, :post_render do |post|
    MermaidInjector.apply(post.site, post)
  end
end