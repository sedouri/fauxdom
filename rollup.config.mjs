import terser from "./node_modules/@rollup/plugin-terser/dist/es/index.js"
import buble from "./node_modules/@rollup/plugin-buble/dist/es/index.js"
import stripCode from "./node_modules/rollup-plugin-strip-code/index.js"
import {spawn} from "node:child_process"
import {zip} from "./node_modules/compressing/index.js"
import path from "node:path"
import fs from "node:fs"

const pkg = JSON.parse( fs.readFileSync( "./package.json", "utf8" ) );

let DEBUG = true;

spawn( process.execPath, ["./scripts/entities.js"] );

export default args =>
{
	DEBUG = !!args.configDebug;
	
	const debugStripper = stripCode( {
		start_comment: "@START_DEBUG",
		end_comment: "@END_DEBUG"
	} );
	const unitTestStripper = stripCode( {
		start_comment: "@START_UNIT_TESTS",
		end_comment: "@END_UNIT_TESTS"
	} );
	const browserStripper = stripCode( {
		start_comment: "@START_BROWSER_ONLY",
		end_comment: "@END_BROWSER_ONLY"
	} );
	
	const modulePlugins = [debugStripper, browserStripper];
	const iifePlugins = [debugStripper, unitTestStripper];
	const iifeLegacyPlugins = [debugStripper, unitTestStripper, buble()];
	const output = [
		{
			onwarn,
			input: "src/document.js",
			plugins: modulePlugins,
			output: [
				module( "esm" ),
				module( "cjs" )
			]
		},
		{
			onwarn,
			input: "src/document.js",
			plugins: iifePlugins,
			output: module( "iife" )
		},
		{
			onwarn,
			input: "src/document.js",
			plugins: iifeLegacyPlugins,
			output: module( "iife", "legacy." )
		}
	];
	
	if ( !DEBUG )
	{
		modulePlugins.push( unitTestStripper, terser( {module: true} ), zipFile() );
		iifePlugins.push( terser(), zipFile() );
		iifeLegacyPlugins.push( terser( {safari10: true} ), zipFile() );
	}
	
	return output;
}

function onwarn( warning )
{
	if ( warning.code !== "CIRCULAR_DEPENDENCY" ||
			!(warning.message.endsWith( "src/node.js -> src/document.js" ) || warning.message.endsWith( "src\\node.js -> src\\document.js" ) ||
				warning.message.endsWith( "src/node.js -> src/html-parser.js" ) || warning.message.endsWith( "src\\node.js -> src\\html-parser.js" ) ||
				warning.message.endsWith( "src/selectors.js -> src/node.js" ) || warning.message.endsWith( "src\\selectors.js -> src\\node.js" )) )
		console.warn( warning );
}

const fileExts = {
	"esm": "mjs",
	"cjs": "cjs"
};

function module( format, ext = "" )
{
	const output = {
		file: `lib/${pkg.name}.${ext}`,
		format,
		interop: false,
		esModule: (format === "esm"),
		freeze: false,
		exports: "default",
		sourcemap: (DEBUG && format === "cjs")
	};
	output.file += fileExts[format] || "js";
	if ( format === "iife" )
		output.name = "DOM";
	return output
}

function zipFile()
{
	return {
		name: "Zip",
		
		renderChunk( src, _chunk, options )
		{
			const ext = path.extname( options.file );
			const srcName = path.basename( options.file, ext );
			const destName = srcName.replace( ".legacy", "" );
			const dirName = path.dirname( options.file );
			
			if ( ext === ".js" || ext === ".mjs" )
				zip.compressFile(
					Buffer.from( src ),
					path.join( dirName, srcName + (ext === ".mjs" ? ".module" : "") +".zip" ),
					{relativePath: destName +".js"}
				);
			
			return null;
		}
	};
}
